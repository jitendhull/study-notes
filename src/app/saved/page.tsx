import type { Metadata } from 'next';
import { getAllNotes, buildTree } from '@/lib/notes';
import { PageShell } from '@/components/PageShell';
import { SavedNotesClient } from '@/components/SavedNotesClient';

export const metadata: Metadata = {
  title: 'Reading List | Study Notes',
  description: 'Your saved BCA study notes on this device.',
};

export default function SavedNotesPage() {
  const notes = getAllNotes();
  const tree = buildTree(notes);

  return (
    <PageShell tree={tree}>
      <div className="page-heading saved-heading">
        <p className="page-eyebrow">Personal index · This device</p>
        <h1 className="page-title">Reading list.</h1>
        <p className="page-description">Keep the notes you want close at hand. Saved notes stay in this browser and do not require an account.</p>
      </div>
      <SavedNotesClient notes={notes} />
    </PageShell>
  );
}
