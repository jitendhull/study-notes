import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllNotes, getNoteRaw, buildTree } from '@/lib/notes';
import { renderMarkdown } from '@/lib/markdown';
import { PageShell } from '@/components/PageShell';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string[] }>;
}

// All note pages pre-rendered at build time
export async function generateStaticParams() {
  const notes = getAllNotes();
  return notes.map(n => ({ slug: n.id.split('/') }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = slug.join('/');
  const raw = getNoteRaw(id);
  if (!raw) return {};
  const { meta } = raw;
  const description = raw.body.replace(/#{1,6}\s/g, '').replace(/\[\[.*?\]\]/g, '').slice(0, 160);
  return {
    title: meta.title,
    description,
    keywords: meta.tags.join(', '),
    openGraph: {
      title: meta.title,
      description,
      type: 'article',
    },
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const id = slug.join('/');
  const raw = getNoteRaw(id);
  if (!raw) notFound();

  const { meta, body } = raw;
  const allNotes = getAllNotes();
  const tree = buildTree(allNotes);
  const html = await renderMarkdown(body, allNotes);

  // Related: same subject + unit, exclude self
  const related = allNotes.filter(n => n.id !== id && n.subject === meta.subject && n.unit === meta.unit);

  // Breadcrumb parts
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: meta.subject.replace(/([A-Z])/g, ' $1').trim(), href: `/search?subject=${meta.subject}` },
    { label: meta.unit, href: `/search?subject=${meta.subject}&unit=${encodeURIComponent(meta.unit)}` },
    { label: meta.title, href: `/note/${id}` },
  ];

  return (
    <PageShell tree={tree} currentId={id}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href}>
            {i > 0 && <span style={{ margin: '0 6px' }}>›</span>}
            {i < breadcrumbs.length - 1
              ? <Link href={crumb.href} style={{ color: 'var(--text-secondary)' }}>{crumb.label}</Link>
              : <span style={{ color: 'var(--text-primary)' }}>{crumb.label}</span>
            }
          </span>
        ))}
      </nav>

      {/* Note header */}
      <header style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <span className={`badge badge-${meta.difficulty}`}>{meta.difficulty}</span>
          {meta.tags.map(t => (
            <Link key={t} href={`/search?tag=${encodeURIComponent(t)}`}
              style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: 9999 }}>
              #{t}
            </Link>
          ))}
        </div>
        {meta.dateUpdated && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Updated {meta.dateUpdated}
          </p>
        )}
      </header>

      {/* Note body */}
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Related notes */}
      {related.length > 0 && (
        <aside style={{ marginTop: '2.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            In the same unit
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {related.map(r => (
              <li key={r.id}>
                <Link href={`/note/${r.id}`} style={{ fontSize: '0.875rem' }}>{r.title}</Link>
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
