'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import type { SearchDoc } from '@/lib/search';
import { makeSnippet } from '@/lib/search';

interface SearchResult {
  id: string; title: string; subject: string; unit: string;
  difficulty: string; snippet: string;
}

interface Props {
  initialQ: string;
  initialSubject: string;
  subjects: string[];
}

export function SearchClient({ initialQ, initialSubject, subjects }: Props) {
  const [q, setQ] = useState(initialQ);
  const [subject, setSubject] = useState(initialSubject);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const indexRef = useRef<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    search: (q: string, opts?: object) => any[];
    docs: Map<string, SearchDoc>;
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lazy-load FlexSearch index on first search
  async function loadIndex() {
    if (indexRef.current) return;
    const [{ Document }, docsResp] = await Promise.all([
      import('flexsearch'),
      fetch('/search-index.json'),
    ]);
    const docs: SearchDoc[] = await docsResp.json();
    const idx = new Document({
      document: { id: 'id', index: ['title', 'subject', 'unit', 'tags', 'body'] },
      tokenize: 'forward',
    });
    const docMap = new Map<string, SearchDoc>();
    for (const doc of docs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      idx.add(doc as any);
      docMap.set(doc.id, doc);
    }
    indexRef.current = { search: idx.search.bind(idx), docs: docMap };
  }

  const doSearch = useCallback(async (query: string, subj: string) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    await loadIndex();
    const idx = indexRef.current!;
    const hits = idx.search(query, { limit: 30, enrich: false });
    const ids = new Set<string>();
    hits.forEach((h: { result: string[] }) => h.result.forEach((id: string) => ids.add(id)));
    let found = [...ids]
      .map(id => idx.docs.get(id))
      .filter((d): d is SearchDoc => !!d);
    if (subj) found = found.filter(d => d.subject === subj);
    setResults(found.map(d => ({
      id: d.id, title: d.title, subject: d.subject,
      unit: d.unit, difficulty: d.difficulty,
      snippet: makeSnippet(d.body, query),
    })));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q, subject), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, subject, doSearch]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (subject) params.set('subject', subject);
    const url = params.toString() ? `/search?${params}` : '/search';
    window.history.replaceState({}, '', url);
  }, [q, subject]);

  return (
    <div>
      {/* Search controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search notes…"
          autoFocus
          aria-label="Search query"
          style={{
            flex: 1, minWidth: 200, padding: '8px 12px',
            border: '1px solid var(--border-strong)', borderRadius: 'var(--radius)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
            fontSize: '1rem',
          }}
        />
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          aria-label="Filter by subject"
          style={{
            padding: '8px 12px', border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontSize: '0.9rem',
          }}
        >
          <option value="">All subjects</option>
          {subjects.map(s => (
            <option key={s} value={s}>{s.replace(/([A-Z])/g, ' $1').trim()}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {loading && <p style={{ color: 'var(--text-secondary)' }}>Searching…</p>}
      {!loading && q && results.length === 0 && (
        <p style={{ color: 'var(--text-secondary)' }}>No results for "{q}"</p>
      )}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {results.map(r => (
            <Link
              key={r.id}
              href={`/note/${r.id}`}
              style={{
                display: 'block', padding: '12px 16px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', color: 'var(--text-primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.title}</span>
                <span className={`badge badge-${r.difficulty}`}>{r.difficulty}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 6 }}>
                {r.subject.replace(/([A-Z])/g, ' $1').trim()} › {r.unit}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {r.snippet}
              </div>
            </Link>
          ))}
        </div>
      )}
      {!q && !loading && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
          Type to search across all notes…
        </p>
      )}
    </div>
  );
}
