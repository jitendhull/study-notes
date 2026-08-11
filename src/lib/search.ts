// Build-time search index (FlexSearch Document).
// Serialized to /public/search-index.json at build.
// Client loads once, searches in memory (<10ms).

import type { NoteMeta } from '@/types';

export interface SearchDoc {
  id: string;
  title: string;
  subject: string;
  unit: string;
  tags: string;     // space-joined for indexing
  body: string;     // first 500 chars (enough for match, lightweight)
  difficulty: string;
}

export function buildSearchDocs(
  notes: NoteMeta[],
  bodies: Map<string, string>,  // id → raw body text
): SearchDoc[] {
  return notes.map(n => ({
    id: n.id,
    title: n.title,
    subject: n.subject,
    unit: n.unit,
    tags: n.tags.join(' '),
    body: (bodies.get(n.id) ?? '').slice(0, 800),
    difficulty: n.difficulty,
  }));
}

// Snippet: find first occurrence of query in body text, return ±100 chars around it
export function makeSnippet(body: string, query: string): string {
  const lower = body.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return body.slice(0, 160) + '…';
  const start = Math.max(0, idx - 60);
  const end = Math.min(body.length, idx + q.length + 100);
  return (start > 0 ? '…' : '') + body.slice(start, end) + (end < body.length ? '…' : '');
}
