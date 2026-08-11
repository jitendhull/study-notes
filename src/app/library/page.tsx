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
        <p className="page-eyebrow">Study library</p>
        <h1 className="page-title">All notes, in one focused workspace.</h1>
        <p className="page-description">Filter by subject, unit, tag, or level. Switch between card and compact list views to find the right study material faster.</p>
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
