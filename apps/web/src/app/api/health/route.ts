import { NextResponse } from 'next/server';

// The keep-awake target. An outside pinger (cron-job.org) requests this every
// 5 minutes so Render's free instance never idles out and visitors never see
// Render's "waking up" page. It does no work and calls nothing paid, so a
// ping costs nothing beyond the request itself.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
