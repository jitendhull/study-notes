'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export const READING_LIST_KEY = 'study-notes:reading-list';
const READING_LIST_EVENT = 'study-notes:reading-list-updated';

export function getSavedNoteIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(READING_LIST_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function setSavedNoteIds(ids: string[]) {
  try {
    window.localStorage.setItem(READING_LIST_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(READING_LIST_EVENT));
  } catch {
    // Storage can be unavailable in private browsing; the control remains usable.
  }
}

export function BookmarkButton({ noteId, noteTitle, compact = false }: {
  noteId: string;
  noteTitle: string;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(getSavedNoteIds().includes(noteId));
    sync();
    setReady(true);
    window.addEventListener(READING_LIST_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(READING_LIST_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [noteId]);

  function toggleSaved() {
    const ids = getSavedNoteIds();
    const next = ids.includes(noteId) ? ids.filter(id => id !== noteId) : [noteId, ...ids];
    setSavedNoteIds(next);
    setSaved(next.includes(noteId));
  }

  return (
    <button
      type="button"
      className={`bookmark-button${saved ? ' bookmark-button-saved' : ''}${compact ? ' bookmark-button-compact' : ''}`}
      onClick={toggleSaved}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${noteTitle} from reading list` : `Save ${noteTitle} to reading list`}
      title={saved ? 'Remove from reading list' : 'Save to reading list'}
      disabled={!ready}
    >
      {saved ? <BookmarkCheck size={compact ? 15 : 17} aria-hidden="true" /> : <Bookmark size={compact ? 15 : 17} aria-hidden="true" />}
      {!compact && <span>{saved ? 'Saved to reading list' : 'Save for later'}</span>}
    </button>
  );
}

export { READING_LIST_EVENT };
