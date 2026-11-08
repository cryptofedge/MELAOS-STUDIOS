import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { REPORT_LIMIT, consume, clientIp, limitedResponse } from '@/lib/rateLimit';
import {
  REPORT_KINDS, REPORT_REASONS, REPORT_CONTEXT_KEYS, REPORT_DETAILS_MAX,
  type ReportKind, type ReportReason, type ReportContext,
} from '@/lib/reports';

// ─────────────────────────────────────────────────────────────────────────
// In-app reports of AI-generated content (songs, lyrics, cover art, Melao's
// chat replies). Google Play requires apps that generate content with AI to
// let people flag offensive output without leaving the app.
//
// Every report is written to the server log — Render → Logs, search for
// "[report]". When REPORT_WEBHOOK_URL is set on Render it is also posted
// there:
//   • a Discord channel webhook   (https://discord.com/api/webhooks/…)
//   • a Slack incoming webhook    (https://hooks.slack.com/services/…)
//   • anything else gets the report as JSON, e.g. a Google Apps Script web
//     app that appends a row to a Sheet.
//
// No IP address or other identifier of the reporter is included. Nothing is
// stored by this server.
// ─────────────────────────────────────────────────────────────────────────

const MAX_CONTEXT_CHARS = 4000;

type Report = {
  id: string;
  at: string;
  kind: ReportKind;
  reason: ReportReason;
  details: string;
  lang: 'es' | 'en';
  page: string;
  context: ReportContext;
};

function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '';
}

function formatText(r: Report): string {
  const lines = [
    `🚩 MELAOS report — ${r.kind} — ${r.reason}`,
    r.details && `Details: ${r.details}`,
    ...REPORT_CONTEXT_KEYS
      .filter(k => r.context[k])
      .map(k => `${k}: ${r.context[k]!.slice(0, k === 'lyrics' || k === 'reply' ? 700 : 300)}`),
    `page: ${r.page || '—'} · lang: ${r.lang} · ${r.at} · id ${r.id}`,
  ];
  return lines.filter(Boolean).join('\n');
}

// Slack treats <, > and & as markup (<!channel> pings everyone).
const slackEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function deliver(report: Report): Promise<void> {
  const url = process.env.REPORT_WEBHOOK_URL;
  if (!url) return;

  let host: string;
  try { host = new URL(url).hostname; } catch {
    console.error('[report] REPORT_WEBHOOK_URL is not a valid URL');
    return;
  }

  const text = formatText(report);
  let payload: unknown;
  if (host === 'discord.com' || host === 'discordapp.com' || host.endsWith('.discord.com')) {
    // allowed_mentions: none, so "@everyone" typed into a report pings nobody.
    payload = { username: 'MELAOS Reports', content: text.slice(0, 1990), allowed_mentions: { parse: [] } };
  } else if (host === 'hooks.slack.com') {
    payload = { text: slackEscape(text).slice(0, 3900) };
  } else {
    payload = report;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`[report] webhook answered ${res.status} for ${report.id}`);
  } catch (err) {
    console.error(`[report] webhook failed for ${report.id}:`, (err as Error).message);
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const kind = REPORT_KINDS.find(k => k === body?.kind);
  const reason = REPORT_REASONS.find(r => r === body?.reason);
  if (!kind || !reason) {
    return NextResponse.json({ error: 'Choose what is wrong with this content.' }, { status: 400 });
  }

  const limit = consume(REPORT_LIMIT, clientIp(req.headers));
  if (!limit.ok) return limitedResponse(limit, 'report');

  const rawContext = body?.context && typeof body.context === 'object' ? body.context : {};
  const context: ReportContext = {};
  for (const key of REPORT_CONTEXT_KEYS) {
    const value = clean(rawContext[key], MAX_CONTEXT_CHARS);
    if (value) context[key] = value;
  }

  const report: Report = {
    id: randomUUID(),
    at: new Date().toISOString(),
    kind,
    reason,
    details: clean(body.details, REPORT_DETAILS_MAX),
    lang: body.lang === 'en' ? 'en' : 'es',
    page: clean(body.page, 200),
    context,
  };

  console.log('[report]', JSON.stringify(report));
  await deliver(report);

  return NextResponse.json({ ok: true, id: report.id });
}
