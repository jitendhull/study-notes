import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllNotes, getNoteRaw, buildTree } from '@/lib/notes';
import { extractNoteHeadings, renderMarkdown } from '@/lib/markdown';
import { PageShell } from '@/components/PageShell';
import { TableOfContents } from '@/components/TableOfContents';
import { BookmarkButton } from '@/components/BookmarkButton';
import { AnnotationPanel } from '@/components/AnnotationPanel';
import { StudyHistoryTracker } from '@/components/StudyHistoryTracker';

interface Props {
  params: Promise<{ slug: string[] }>;
}

// generateStaticParams shares module-level cache with page render —
// getAllNotes() walks the vault once for the entire build.
export async function generateStaticParams() {
  return getAllNotes().map(n => ({ slug: n.id.split('/') }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = getNoteRaw(slug.join('/'));
  if (!raw) return {};
  const { meta, body } = raw;
  const description = body
    .replace(/#{1,6}\s/g, '')
    .replace(/\[\[.*?\]\]/g, '')
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/\$[^$\n]+\$/g, '')
    .trim()
    .slice(0, 160);
  return {
    title: meta.title,
    description,
    keywords: meta.tags.join(', '),
    openGraph: { title: meta.title, description, type: 'article' },
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const id = slug.join('/');
  const raw = getNoteRaw(id);
  if (!raw) notFound();

  const { meta, body } = raw;
  // getAllNotes() returns cached array — no extra fs read
  const allNotes = getAllNotes();
  const tree = buildTree(allNotes);
  const html = await renderMarkdown(body, allNotes);
  const headings = extractNoteHeadings(body);

  const related = allNotes.filter(n => n.id !== id && n.subject === meta.subject && n.unit === meta.unit);
  const subjectLabel = meta.subject.replace(/([A-Z])/g, ' $1').trim();

  return (
    <PageShell tree={tree} currentId={id}>
      <StudyHistoryTracker id={id} title={meta.title} subject={meta.subject} unit={meta.unit} />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href={`/search?subject=${meta.subject}`} className="breadcrumb-link">{subjectLabel}</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href={`/search?subject=${meta.subject}&unit=${encodeURIComponent(meta.unit)}`} className="breadcrumb-link">{meta.unit}</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{meta.title}</span>
      </nav>

      {/* Note meta bar */}
      <header className="note-header">
        <div className="note-tags">
          <span className={`badge badge-${meta.difficulty}`}>{meta.difficulty}</span>
          {meta.tags.map(t => (
            <Link key={t} href={`/search?tag=${encodeURIComponent(t)}`} className="tag-pill">
              #{t}
            </Link>
          ))}
        </div>
        <div className="note-header-actions">
          {meta.dateUpdated && (
            <p className="note-date">Updated {meta.dateUpdated}</p>
          )}
          <BookmarkButton noteId={id} noteTitle={meta.title} />
        </div>
      </header>

      {/* Note body + static table of contents */}
      <div className="note-reading-layout">
        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        <TableOfContents headings={headings} />
      </div>

      <AnnotationPanel noteId={id} />

      {/* Related notes */}
      {related.length > 0 && (
        <aside className="related-box">
          <h3 className="related-title">In this unit</h3>
          <ul className="related-list">
            {related.map(r => (
              <li key={r.id}>
                <Link href={`/note/${r.id}`} className="related-link">{r.title}</Link>
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: meta.title,
        keywords: meta.tags.join(', '),
        datePublished: meta.dateCreated,
        dateModified: meta.dateUpdated,
      })}} />
    </PageShell>
  );
}
