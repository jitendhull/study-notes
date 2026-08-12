'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { searchNotes, type IndexedSearchResult, type SearchFilters } from '@/lib/search-client';
import { SubjectProgress } from '@/components/SubjectProgress';

interface Props {
  initialQ: string;
  initialSubject?: string;
  initialUnit?: string;
  initialTag?: string;
  initialDifficulty?: string;
  subjects: string[];
  units: string[];
  tags: string[];
  subjectNoteIds: string[];
}

const DIFFICULTIES = ['easy', 'intermediate', 'hard'];

function formatLabel(value: string) {
  return value.replace(/([A-Z])/g, ' $1').trim();
}

function activeFilterLabel(filters: SearchFilters) {
  return [filters.subject, filters.unit, filters.tag ? `#${filters.tag}` : '', filters.difficulty]
    .filter(Boolean)
    .map(value => formatLabel(value!))
    .join(' · ');
}

export function SearchClient({
  initialQ,
  initialSubject = '',
  initialUnit = '',
  initialTag = '',
  initialDifficulty = '',
  subjects,
  units,
  tags,
  subjectNoteIds,
}: Props) {
  const [q, setQ] = useState(initialQ);
  const [filters, setFilters] = useState<SearchFilters>({
    subject: initialSubject,
    unit: initialUnit,
    tag: initialTag,
    difficulty: initialDifficulty,
  });
  const [results, setResults] = useState<IndexedSearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (query: string, activeFilters: SearchFilters) => {
    if (!query.trim()) {
      setResults([]);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    try {
      const found = await searchNotes(query, activeFilters);
      setResults(found);
      setStatus('done');
    } catch (error) {
      console.error('Unable to load the search index', error);
      setResults([]);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q, filters), 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, filters, doSearch]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (filters.subject) params.set('subject', filters.subject);
    if (filters.unit) params.set('unit', filters.unit);
    if (filters.tag) params.set('tag', filters.tag);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    window.history.replaceState({}, '', params.size ? `/search?${params}` : '/search');
  }, [q, filters]);

  function setFilter<K extends keyof SearchFilters>(key: K, value: string) {
    setFilters(current => ({ ...current, [key]: value }));
  }

  const scope = activeFilterLabel(filters);

  return (
    <div className="search-experience">
      <div className="search-controls">
        <input
          type="search"
          value={q}
          onChange={event => setQ(event.target.value)}
          placeholder="Search a concept, topic, or tag…"
          autoFocus
          aria-label="Search query"
          className="search-input"
        />
      </div>

      {filters.subject && subjectNoteIds.length > 0 && (
        <SubjectProgress subject={filters.subject} noteIds={subjectNoteIds} />
      )}

      <div className="search-filter-row" aria-label="Search filters">
        <select value={filters.subject ?? ''} onChange={event => setFilter('subject', event.target.value)} aria-label="Filter by subject" className="search-filter-select">
          <option value="">All subjects</option>
          {subjects.map(subject => <option key={subject} value={subject}>{formatLabel(subject)}</option>)}
        </select>
        <select value={filters.unit ?? ''} onChange={event => setFilter('unit', event.target.value)} aria-label="Filter by unit" className="search-filter-select">
          <option value="">All units</option>
          {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
        </select>
        <select value={filters.tag ?? ''} onChange={event => setFilter('tag', event.target.value)} aria-label="Filter by tag" className="search-filter-select">
          <option value="">All tags</option>
          {tags.map(tag => <option key={tag} value={tag}>#{tag}</option>)}
        </select>
        <select value={filters.difficulty ?? ''} onChange={event => setFilter('difficulty', event.target.value)} aria-label="Filter by difficulty" className="search-filter-select">
          <option value="">All levels</option>
          {DIFFICULTIES.map(difficulty => <option key={difficulty} value={difficulty}>{formatLabel(difficulty)}</option>)}
        </select>
      </div>

      {status === 'loading' && (
        <div className="search-results search-results-skeleton" aria-label="Loading results" aria-busy="true">
          {[0, 1, 2].map(index => (
            <div key={index} className="search-skeleton-card" aria-hidden="true">
              <span className="skeleton-line skeleton-line-title" />
              <span className="skeleton-line skeleton-line-meta" />
              <span className="skeleton-line skeleton-line-copy" />
              <span className="skeleton-line skeleton-line-copy skeleton-line-short" />
            </div>
          ))}
        </div>
      )}

      {status === 'done' && q && (
        <p className="search-summary" role="status">
          {results.length} {results.length === 1 ? 'result' : 'results'} for <strong>“{q}”</strong>{scope ? ` in ${scope}` : ''}
        </p>
      )}

      {status === 'done' && results.length > 0 && (
        <div className="search-results" role="list" aria-live="polite">
          {results.map(result => (
            <Link key={result.id} href={`/note/${result.id}`} className="result-card" role="listitem">
              <div className="result-title-row">
                <span className="result-title">{result.title}</span>
                <span className={`badge badge-${result.difficulty}`}>{result.difficulty}</span>
              </div>
              <div className="result-meta">{formatLabel(result.subject)} <span aria-hidden="true">›</span> {result.unit}</div>
              <div className="result-snippet">{result.snippet}</div>
            </Link>
          ))}
        </div>
      )}

      {status === 'done' && q && results.length === 0 && (
        <div className="search-empty-state" role="status">
          <h2>No matching notes yet.</h2>
          <p>Try a broader term, or clear the filters to search the full library.</p>
          <div className="search-empty-actions">
            <button type="button" className="catalogue-quiet-link" onClick={() => { setQ(''); setFilters({}); }}>Clear search</button>
            <Link href="/library" className="catalogue-quiet-link">Browse subjects</Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <p className="search-empty" role="alert">Search is temporarily unavailable. Please refresh and try again.</p>
      )}

      {status === 'idle' && (
        <p className="search-hint">Use filters to narrow results, or press <kbd>⌘</kbd> <kbd>K</kbd> from anywhere to search.</p>
      )}
    </div>
  );
}
