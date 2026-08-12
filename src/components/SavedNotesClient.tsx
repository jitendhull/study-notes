'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { NoteMeta } from '@/types';
import { BookmarkButton, getSavedNoteIds, READING_LIST_EVENT } from '@/components/BookmarkButton';

function formatSubject(value: string) {
  return value.replace(/([A-Z])/g, ' $1').trim();
}

export function SavedNotesClient({ notes }: { notes: NoteMeta[] }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setSavedIds(getSavedNoteIds());
    sync();
    setReady(true);
    window.addEventListener(READING_LIST_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(READING_LIST_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const notesById = useMemo(() => new Map(notes.map(note => [note.id, note])), [notes]);
  const savedNotes = savedIds.map(id => notesById.get(id)).filter((note): note is NoteMeta => Boolean(note));

  if (!ready) {
    return (
      <div className="collection-loading" aria-label="Loading your reading list" aria-busy="true">
        {[0, 1, 2].map(index => <span key={index} className="collection-loading-row" aria-hidden="true" />)}
      </div>
    );
  }

  if (savedNotes.length === 0) {
    return (
      <div className="reading-list-empty">
        <Bookmark size={22} aria-hidden="true" />
        <h2>Your reading list is empty.</h2>
        <p>Save notes as you browse and they will stay here on this device for quick access.</p>
        <div className="empty-state-actions">
          <Link href="/library" className="catalogue-quiet-link">Browse subjects</Link>
          <Link href="/search" className="catalogue-quiet-link">Search a topic</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-notes-list" role="list" aria-label="Saved notes">
      {savedNotes.map(note => (
        <div key={note.id} className="saved-note-row" role="listitem">
          <Link href={`/note/${note.id}`} className="saved-note-link">
            <span className="catalogue-index">{formatSubject(note.subject)}</span>
            <span className="saved-note-copy"><strong>{note.title}</strong><small>{note.unit} · {note.wordCount.toLocaleString()} words</small></span>
          </Link>
          <BookmarkButton noteId={note.id} noteTitle={note.title} compact />
        </div>
      ))}
    </div>
  );
}
