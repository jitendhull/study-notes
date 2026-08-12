'use client';

import Link from 'next/link';
import { FilePenLine } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { NoteMeta } from '@/types';
import { ANNOTATIONS_EVENT, getAnnotationMap } from '@/components/AnnotationStorage';

function formatSubject(value: string) {
  return value.replace(/([A-Z])/g, ' $1').trim();
}

export function AnnotatedNotesClient({ notes }: { notes: NoteMeta[] }) {
  const [annotationMap, setAnnotationMap] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setAnnotationMap(getAnnotationMap());
    sync();
    setReady(true);
    window.addEventListener(ANNOTATIONS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(ANNOTATIONS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const notesById = useMemo(() => new Map(notes.map(note => [note.id, note])), [notes]);
  const annotatedNotes = Object.entries(annotationMap)
    .map(([id, annotation]) => ({ note: notesById.get(id), annotation }))
    .filter((entry): entry is { note: NoteMeta; annotation: string } => Boolean(entry.note));

  if (!ready) {
    return (
      <div className="collection-loading" aria-label="Loading your annotations" aria-busy="true">
        {[0, 1, 2].map(index => <span key={index} className="collection-loading-row" aria-hidden="true" />)}
      </div>
    );
  }

  if (annotatedNotes.length === 0) {
    return (
      <div className="annotation-empty">
        <FilePenLine size={22} aria-hidden="true" />
        <h2>No annotations yet.</h2>
        <p>Open a note, write a definition, question, or revision reminder, and save it here for later.</p>
        <div className="empty-state-actions">
          <Link href="/library" className="catalogue-quiet-link">Browse subjects</Link>
          <Link href="/search" className="catalogue-quiet-link">Search a topic</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="annotation-list" role="list" aria-label="Your private annotations">
      {annotatedNotes.map(({ note, annotation }) => (
        <article key={note.id} className="annotation-row" role="listitem">
          <div className="annotation-row-main">
            <div className="annotation-row-meta">{formatSubject(note.subject)} · {note.unit}</div>
            <Link href={`/note/${note.id}`} className="annotation-row-title">{note.title}</Link>
            <p>{annotation}</p>
          </div>
          <Link href={`/note/${note.id}#annotation-title`} className="annotation-open-link">Open note</Link>
        </article>
      ))}
    </div>
  );
}
