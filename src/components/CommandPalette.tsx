'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Command, FileText, Search, X } from 'lucide-react';
import { searchNotes, type IndexedSearchResult } from '@/lib/search-client';

const RECENT_KEY = 'study-notes:recent-searches';
const MAX_RECENT_SEARCHES = 5;

function readRecentSearches() {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
}

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IndexedSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const focusInput = useCallback(() => {
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(current => !current);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || !query.trim()) {
      setResults([]);
      setStatus('idle');
      return;
    }

    const timer = window.setTimeout(async () => {
      setStatus('loading');
      try {
        setResults(await searchNotes(query, {}, 8));
        setStatus('done');
      } catch (error) {
        console.error('Unable to load command palette results', error);
        setStatus('error');
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  useEffect(() => setActiveIndex(0), [results]);

  function rememberSearch(value: string) {
    const normalized = value.trim();
    if (!normalized) return;
    const next = [normalized, ...recentSearches.filter(item => item.toLowerCase() !== normalized.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  function selectResult(result: IndexedSearchResult) {
    rememberSearch(query);
    setOpen(false);
    router.push(`/note/${result.id}`);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(current => (current + 1) % results.length);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(current => (current - 1 + results.length) % results.length);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      selectResult(results[activeIndex]);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={nextOpen => {
      setOpen(nextOpen);
      if (nextOpen) focusInput();
    }}>
      <Dialog.Trigger asChild>
        <button type="button" className="command-trigger" aria-label="Open note search command palette">
          <Search size={16} strokeWidth={2} aria-hidden="true" />
          <span className="command-trigger-label">Search notes</span>
          <span className="command-shortcut" aria-hidden="true"><Command size={12} />K</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="command-overlay" />
        <Dialog.Content className="command-dialog" aria-describedby="command-dialog-description" onOpenAutoFocus={event => {
          event.preventDefault();
          focusInput();
        }}>
          <Dialog.Title className="sr-only">Search study notes</Dialog.Title>
          <Dialog.Description id="command-dialog-description" className="sr-only">Search notes by title, topic, subject, unit, or tag.</Dialog.Description>
          <div className="command-search-row">
            <Search size={20} strokeWidth={2} aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search concepts, topics, or tags…"
              aria-label="Search study notes"
              aria-controls="command-results"
              aria-activedescendant={results[activeIndex] ? `command-result-${activeIndex}` : undefined}
              className="command-input"
            />
            <Dialog.Close asChild>
              <button type="button" className="command-close" aria-label="Close search"><X size={18} /></button>
            </Dialog.Close>
          </div>

          <div id="command-results" className="command-results" role="listbox">
            {status === 'loading' && <p className="command-status">Searching your study library…</p>}
            {status === 'error' && <p className="command-status" role="alert">Search could not be loaded. Please try again.</p>}

            {status === 'done' && results.map((result, index) => (
              <button
                key={result.id}
                id={`command-result-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                className={`command-result${activeIndex === index ? ' command-result-active' : ''}`}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => selectResult(result)}
              >
                <span className="command-result-icon"><FileText size={17} aria-hidden="true" /></span>
                <span className="command-result-copy">
                  <span className="command-result-title">{result.title}</span>
                  <span className="command-result-meta">{result.subject.replace(/([A-Z])/g, ' $1').trim()} · {result.unit}</span>
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ))}

            {status === 'done' && results.length === 0 && <p className="command-status">No notes matched “{query}”.</p>}

            {status === 'idle' && recentSearches.length > 0 && (
              <div className="command-recents">
                <p className="command-section-label">Recent searches</p>
                {recentSearches.map(item => (
                  <button key={item} type="button" className="command-recent" onClick={() => setQuery(item)}>
                    <Search size={15} aria-hidden="true" /> {item}
                  </button>
                ))}
              </div>
            )}

            {status === 'idle' && recentSearches.length === 0 && (
              <p className="command-status">Start typing to search across every note. Use <kbd>↑</kbd> <kbd>↓</kbd> then <kbd>Enter</kbd> to open a result.</p>
            )}
          </div>
          <div className="command-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span><span><kbd>Enter</kbd> to open</span><span><kbd>Esc</kbd> to close</span></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
