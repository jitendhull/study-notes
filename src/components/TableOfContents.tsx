'use client';

import { useEffect, useState } from 'react';
import type { NoteHeading } from '@/lib/markdown';

export function TableOfContents({ headings }: { headings: NoteHeading[] }) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 720px)');
    const syncToViewport = () => setIsOpen(query.matches);

    syncToViewport();
    query.addEventListener('change', syncToViewport);
    return () => query.removeEventListener('change', syncToViewport);
  }, []);

  if (headings.length < 2) return null;

  return (
    <details
      className="note-toc"
      open={isOpen}
      onToggle={event => setIsOpen(event.currentTarget.open)}
    >
      <summary className="note-toc-label">
        <span>On this page</span>
        <span className="note-toc-toggle" aria-hidden="true" />
      </summary>
      <ol className="note-toc-list">
        {headings.map(heading => (
          <li key={heading.id} className={heading.depth === 3 ? 'note-toc-subitem' : undefined}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </details>
  );
}
