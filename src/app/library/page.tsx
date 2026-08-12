import type { Metadata } from 'next';
import { getAllNotes, buildSiteMetadata, buildTree } from '@/lib/notes';
import { PageShell } from '@/components/PageShell';
import { NoteBrowser } from '@/components/NoteBrowser';

export const metadata: Metadata = {
  title: 'All notes',
  description: 'Browse, filter, and sort every MDU BCA study note.',
};

export default function LibraryPage() {
  const notes = getAllNotes();
  const metadata = buildSiteMetadata(notes);
  const tree = buildTree(notes);

  return (
    <PageShell tree={tree}>
      <div className="page-heading library-heading">
        <p className="page-eyebrow">Semester catalogue</p>
        <h1 className="page-title">The complete note index.</h1>
        <p className="page-description">Filter the collection by subject, unit, tag, or level. Use the compact view for a quick scan, or open a note directly from the catalogue.</p>
      </div>
      <NoteBrowser
        notes={notes}
        subjects={metadata.subjects.filter(subject => subject !== 'General')}
        units={metadata.units}
        tags={metadata.tags}
      />
    </PageShell>
  );
}
