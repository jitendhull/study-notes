import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllNotes, buildTree, buildSiteMetadata } from '@/lib/notes';
import { PageShell } from '@/components/PageShell';
import { CommandPalette } from '@/components/CommandPalette';
import { ContinueStudying } from '@/components/ContinueStudying';

export const metadata: Metadata = {
  title: 'Study Notes — MDU BCA Semester I',
  description: 'A searchable BCA Semester I reference library for Mathematics, Problem Solving, and related coursework.',
};

const SUBJECT_DETAILS: Record<string, { label: string; description: string }> = {
  Mathematics: {
    label: 'Mathematics',
    description: 'Sets, relations, functions, counting, graphs, matrices, and the foundations used across computing.',
  },
  ProblemSolving: {
    label: 'Problem Solving',
    description: 'Problem formulation, algorithmic reasoning, structured programming, and practical solution methods.',
  },
};

const asLabel = (value: string) => value.replace(/([A-Z])/g, ' $1').trim();

function Stat({ value, fullLabel, mobileLabel }: { value: number; fullLabel: string; mobileLabel: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span className="catalogue-stat-label catalogue-stat-label-full">{fullLabel}</span>
      <span className="catalogue-stat-label catalogue-stat-label-mobile">{mobileLabel}</span>
    </div>
  );
}

export default function HomePage() {
  const notes = getAllNotes();
  const tree = buildTree(notes);
  const meta = buildSiteMetadata(notes);
  const subjects = meta.subjects.filter(subject => subject !== 'General');
  const recentNotes = [...notes]
    .sort((a, b) => (b.dateUpdated || b.dateCreated).localeCompare(a.dateUpdated || a.dateCreated))
    .slice(0, 5);

  const subjectCount = (subject: string) => Object.values(tree).flatMap(semester =>
    Object.values(semester[subject] ?? {}).flat(),
  ).length;

  return (
    <PageShell tree={tree}>
      <div className="catalogue-home">
        <header className="catalogue-intro catalogue-intro-study-first" aria-labelledby="home-title">
          <p className="catalogue-kicker">MDU BCA · Semester I</p>
          <h1 id="home-title">Find the note you need.</h1>
          <p className="catalogue-summary">
            Search every topic, or open a subject to continue studying.
          </p>
          <div className="catalogue-home-search" aria-label="Search the study library">
            <CommandPalette variant="home" />
          </div>
          <div className="catalogue-mobile-actions" aria-label="Primary study actions">
            <a href="#subjects-heading" className="catalogue-mobile-subject-link">Browse subjects <span aria-hidden="true">↓</span></a>
          </div>
          <div className="catalogue-links" aria-label="Primary study actions">
            <Link href="/library" className="catalogue-action-link">
              <span className="catalogue-action-label-long">Browse the complete catalogue</span>
              <span className="catalogue-action-label-short">Browse catalogue</span>
            </Link>
            <Link href="/search" className="catalogue-action-link">
              <span className="catalogue-action-label-long">Search a topic</span>
              <span className="catalogue-action-label-short">Search notes</span>
            </Link>
          </div>
        </header>

        <ContinueStudying />

        <section className="catalogue-register" aria-label="Library register">
          <Stat value={meta.stats.totalNotes} fullLabel="notes in this library" mobileLabel="notes" />
          <Stat value={subjects.length} fullLabel="subjects in this semester" mobileLabel="subjects" />
          <Stat value={meta.semesters.length} fullLabel="semester represented" mobileLabel="semester" />
        </section>

        <section className="catalogue-section" aria-labelledby="subjects-heading">
          <div className="catalogue-section-heading">
            <p className="catalogue-kicker">By subject</p>
            <h2 id="subjects-heading">Browse subjects</h2>
          </div>
          <div className="catalogue-subjects">
            {subjects.map((subject, index) => {
              const details = SUBJECT_DETAILS[subject] ?? {
                label: asLabel(subject),
                description: 'Browse the concepts, units, and revision material for this subject.',
              };
              const count = subjectCount(subject);
              return (
                <Link key={subject} href={`/search?subject=${encodeURIComponent(subject)}`} className="catalogue-subject-row">
                  <span className="catalogue-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="catalogue-subject-copy"><strong>{details.label}</strong><small>{details.description}</small></span>
                  <span className="catalogue-count">{count} {count === 1 ? 'note' : 'notes'}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="catalogue-section catalogue-recent" aria-labelledby="recent-heading">
          <div className="catalogue-section-heading catalogue-section-heading-split">
            <div>
              <p className="catalogue-kicker">Recently updated</p>
              <h2 id="recent-heading">Recently updated</h2>
            </div>
            <Link href="/library" className="catalogue-quiet-link">View every note</Link>
          </div>
          <ol className="catalogue-note-list">
            {recentNotes.map((note, index) => (
              <li key={note.id}>
                <Link href={`/note/${note.id}`}>
                  <span className="catalogue-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="catalogue-note-copy"><strong>{note.title}</strong><small>{asLabel(note.subject)} · {note.unit}</small></span>
                  <span className="catalogue-note-meta">{note.wordCount.toLocaleString()} words</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <aside className="catalogue-note" aria-label="How to use this library">
          <p className="catalogue-kicker">Using the library</p>
          <p>Each note keeps its place in the subject and unit tree. Open a note to read it in context, use its contents list to move through longer material, then continue through related notes from the same unit.</p>
        </aside>
      </div>
    </PageShell>
  );
}
