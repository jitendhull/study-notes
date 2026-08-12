import type { Metadata } from 'next';
import { getAllNotes, buildTree, buildSiteMetadata } from '@/lib/notes';
import { PageShell } from '@/components/PageShell';
import { SearchClient } from '@/components/SearchClient';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search across all BCA study notes.',
  robots: { index: false, follow: false }, // don't index search page
};

interface Props {
  searchParams: Promise<{ q?: string; subject?: string; unit?: string; tag?: string; difficulty?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const initialQ = sp.q ?? sp.tag ?? '';
  const initialSubject = sp.subject ?? '';
  const initialUnit = sp.unit ?? '';
  const initialTag = sp.tag ?? '';
  const initialDifficulty = sp.difficulty ?? '';

  const notes = getAllNotes();
  const tree = buildTree(notes);
  const meta = buildSiteMetadata(notes);

  return (
    <PageShell tree={tree}>
      <div className="page-heading">
        <p className="page-eyebrow">Search the catalogue</p>
        <h1 className="page-title">Find a concept.</h1>
        <p className="page-description">Search titles and note text, then narrow the results by subject, unit, tag, or level.</p>
      </div>
      <SearchClient
        initialQ={initialQ}
        initialSubject={initialSubject}
        initialUnit={initialUnit}
        initialTag={initialTag}
        initialDifficulty={initialDifficulty}
        subjects={meta.subjects.filter(s => s !== 'General')}
        units={meta.units}
        tags={meta.tags}
      />
    </PageShell>
  );
}
