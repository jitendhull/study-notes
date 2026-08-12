import type { Metadata } from 'next';
import { getAllNotes, buildTree } from '@/lib/notes';
import { PageShell } from '@/components/PageShell';
import { AnnotatedNotesClient } from '@/components/AnnotatedNotesClient';

export const metadata: Metadata = {
  title: 'My annotations | Study Notes',
  description: 'Private, offline annotations attached to your study notes.',
};

export default function AnnotationsPage() {
  const notes = getAllNotes();
  return (
    <PageShell tree={buildTree(notes)}>
      <div className="annotations-page">
        <header className="page-heading">
          <p className="page-kicker">Personal index · This device</p>
          <h1 className="page-title">My annotations.</h1>
          <p className="page-intro">Private reminders, definitions, questions, and revision prompts attached to your notes. They stay in this browser and work offline.</p>
        </header>
        <AnnotatedNotesClient notes={notes} />
      </div>
    </PageShell>
  );
}
