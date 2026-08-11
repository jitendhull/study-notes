import type { NoteHeading } from '@/lib/markdown';

export function TableOfContents({ headings }: { headings: NoteHeading[] }) {
  if (headings.length < 2) return null;

  return (
    <nav className="note-toc" aria-label="On this page">
      <p className="note-toc-label">On this page</p>
      <ol className="note-toc-list">
        {headings.map(heading => (
          <li key={heading.id} className={heading.depth === 3 ? 'note-toc-subitem' : undefined}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
