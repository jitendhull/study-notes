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
  searchParams: Promise<{ q?: string; subject?: string; tag?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const initialQ = sp.q ?? sp.tag ?? '';
  const initialSubject = sp.subject ?? '';

  const notes = getAllNotes();
  const tree = buildTree(notes);
  const meta = buildSiteMetadata(notes);

  return (
    <PageShell tree={tree}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 1.5rem' }}>Search</h1>
      <SearchClient
        initialQ={initialQ}
        initialSubject={initialSubject}
        subjects={meta.subjects.filter(s => s !== 'General')}
      />
    </PageShell>
  );
}
