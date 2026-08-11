'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import type { SearchDoc } from '@/lib/search';
import { makeSnippet } from '@/lib/search';

interface SearchResult {
  id: string; title: string; subject: string;
  unit: string; difficulty: string; snippet: string;
}

interface Props {
  initialQ: string;
  initialSubject: string;
  subjects: string[];
}

// Module-level index cache — persists across re-renders and page navigations
// (Next.js App Router keeps client modules in memory during session).
let _indexCache: {
  search: (q: string, opts: object) => Array<{ result: string[] }>;
  docs: Map<string, SearchDoc>;
} | null = null;
let _indexLoading: Promise<void> | null = null;

async function loadIndex(): Promise<void> {
  if (_indexCache) return;
  if (_indexLoading) return _indexLoading;

  _indexLoading = (async () => {
    const [{ Document }, res] = await Promise.all([
      import('flexsearch'),
      fetch('/search-index.json'),
    ]);
    const docs: SearchDoc[] = await res.json();
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
    _indexCache = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search: idx.search.bind(idx) as any,
      docs: docMap,
    };
    _indexLoading = null;
  })();

  return _indexLoading;
}

export function SearchClient({ initialQ, initialSubject, subjects }: Props) {
  const [q, setQ] = useState(initialQ);
  const [subject, setSubject] = useState(initialSubject);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (query: string, subj: string) => {
    if (!query.trim()) { setResults([]); setStatus('idle'); return; }
    setStatus('loading');
    await loadIndex();
    const idx = _indexCache!;
    const hits = idx.search(query, { limit: 30, enrich: false });
    const seen = new Set<string>();
    hits.forEach((h: { result: string[] }) => h.result.forEach(id => seen.add(id)));
    let found = [...seen].map(id => idx.docs.get(id)).filter((d): d is SearchDoc => !!d);
    if (subj) found = found.filter(d => d.subject === subj);
    setResults(found.map(d => ({
      id: d.id, title: d.title, subject: d.subject,
      unit: d.unit, difficulty: d.difficulty,
      snippet: makeSnippet(d.body, query),
    })));
    setStatus('done');
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q, subject), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, subject, doSearch]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (subject) params.set('subject', subject);
    window.history.replaceState({}, '', params.size ? `/search?${params}` : '/search');
  }, [q, subject]);

  return (
    <div>
      <div className="search-controls">
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search notes…"
          autoFocus
          aria-label="Search query"
          className="search-input"
        />
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          aria-label="Filter by subject"
          className="search-select"
        >
          <option value="">All subjects</option>
          {subjects.map(s => (
            <option key={s} value={s}>{s.replace(/([A-Z])/g, ' $1').trim()}</option>
          ))}
        </select>
      </div>

      {/* Loading skeleton */}
      {status === 'loading' && (
        <div className="search-results">
          {[0,1,2].map(i => <div key={i} className="skeleton" />)}
        </div>
      )}

      {/* Results */}
      {status === 'done' && results.length > 0 && (
        <div className="search-results" role="list" aria-live="polite">
          {results.map(r => (
            <Link key={r.id} href={`/note/${r.id}`} className="result-card" role="listitem">
              <div className="result-title-row">
                <span className="result-title">{r.title}</span>
                <span className={`badge badge-${r.difficulty}`}>{r.difficulty}</span>
              </div>
              <div className="result-meta">
                {r.subject.replace(/([A-Z])/g, ' $1').trim()} › {r.unit}
              </div>
              <div className="result-snippet">{r.snippet}</div>
            </Link>
          ))}
        </div>
      )}

      {status === 'done' && q && results.length === 0 && (
        <p className="search-empty">No results for "{q}"</p>
      )}

      {status === 'idle' && (
        <p className="search-hint">Type to search across all notes…</p>
      )}
    </div>
  );
}
