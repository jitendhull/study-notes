// Analytics: Umami Cloud (free, privacy-first, no cookies, GDPR-ok)
// Fallback: simple Netlify KV view counter for note-specific stats
//
// Setup:
//   1. Sign up at https://umami.is/  (free, unlimited events)
//   2. Add site → get WEBSITE_ID
//   3. Set env var: NEXT_PUBLIC_UMAMI_WEBSITE_ID=<your-id>
//   4. Script injects in layout.tsx — no code needed here for page views
//
// For note-specific view counts (top notes, per-note stats):
//   Uses Netlify Blobs (free KV, serverless-persistent).
//   Falls back to no-op if NETLIFY_BLOBS_CONTEXT not set (local dev).

export const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? '';
export const UMAMI_SRC = 'https://cloud.umami.is/script.js';

// ponytail: note-level view counts — add Netlify Blobs integration
// when you need top-notes ranking or per-note view count display.
// Current: Umami's dashboard shows note pages grouped by URL — enough for now.
