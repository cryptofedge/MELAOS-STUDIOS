// Shared by the Report button (client) and /api/report (server).
//
// Google Play requires apps that generate content with AI to let people
// report offensive output from inside the app. Every AI surface — songs,
// lyrics, cover art and Melao's chat replies — carries a Report button that
// posts here.

export const REPORT_KINDS = ['song', 'lyrics', 'cover-art', 'chat'] as const;
export type ReportKind = typeof REPORT_KINDS[number];

export const REPORT_REASONS = ['offensive', 'sexual', 'violence', 'harassment', 'copyright', 'other'] as const;
export type ReportReason = typeof REPORT_REASONS[number];

// What the report carries about the reported item. Text only: the audio and
// image themselves are not sent.
export const REPORT_CONTEXT_KEYS = [
  'title', 'prompt', 'genre', 'mood', 'lyrics', 'influences', 'engine', 'coverPrompt', 'message', 'reply',
] as const;
export type ReportContext = Partial<Record<typeof REPORT_CONTEXT_KEYS[number], string>>;

export const REPORT_DETAILS_MAX = 1000;
