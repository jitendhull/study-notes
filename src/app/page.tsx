import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookMarked,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  LibraryBig,
  Search,
  Sparkles,
} from 'lucide-react';
import { getAllNotes, buildTree, buildSiteMetadata } from '@/lib/notes';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Study Notes — MDU BCA Semester I',
  description: 'A focused, searchable BCA study library for Mathematics and Problem Solving.',
};

const SUBJECT_DETAILS: Record<string, { label: string; description: string }> = {
  Mathematics: {
    label: 'Mathematics',
    description: 'Build confidence with sets, relations, functions, and visual reasoning.',
  },
  ProblemSolving: {
    label: 'Problem Solving',
    description: 'Learn to frame problems, choose methods, and reason through solutions.',
  },
};

export default function HomePage() {
  const notes = getAllNotes();
  const tree = buildTree(notes);
  const meta = buildSiteMetadata(notes);
  const subjects = meta.subjects.filter(subject => subject !== 'General');
  const featuredNotes = [...notes]
    .sort((a, b) => b.wordCount - a.wordCount || a.title.localeCompare(b.title))
    .slice(0, 3);

  const subjectCount = (subject: string) => Object.values(tree).flatMap(semester =>
    Object.values(semester[subject] ?? {}).flat(),
  ).length;

  return (
    <PageShell tree={tree}>
      <div className="landing-page">
        <section className="landing-hero" aria-labelledby="home-title">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow"><Sparkles size={14} aria-hidden="true" /> MDU BCA · Semester I</p>
            <h1 id="home-title">Study with a clear path, not a crowded tab bar.</h1>
            <p className="landing-lede">
              A focused library for building understanding, revising quickly, and returning to the exact concept you need.
            </p>
            <div className="landing-actions">
              <Link href="/library" className="landing-btn landing-btn-primary">
                Explore all notes <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/search" className="landing-btn landing-btn-secondary">
                <Search size={17} aria-hidden="true" /> Search a topic
              </Link>
            </div>
            <div className="landing-trust-row" aria-label="Study library summary">
              <span><CheckCircle2 size={16} aria-hidden="true" /> Structured by subject</span>
              <span><Clock3 size={16} aria-hidden="true" /> Ready for revision</span>
              <span><BookMarked size={16} aria-hidden="true" /> {meta.stats.totalNotes} curated notes</span>
            </div>
          </div>

          <aside className="landing-study-card" aria-label="Your study library at a glance">
            <div className="landing-card-topline">
              <span className="landing-status-dot" aria-hidden="true" />
              <span>YOUR STUDY LIBRARY</span>
              <BookOpenCheck size={17} aria-hidden="true" />
            </div>
            <p className="landing-card-heading">Everything for this semester, one intentional place.</p>
            <div className="landing-card-stats">
              <div><strong>{meta.stats.totalNotes}</strong><span>notes</span></div>
              <div><strong>{subjects.length}</strong><span>subjects</span></div>
              <div><strong>{meta.semesters.length}</strong><span>semester</span></div>
            </div>
            <div className="landing-card-list">
              {featuredNotes.map((note, index) => (
                <Link key={note.id} href={`/note/${note.id}`} className="landing-card-note">
                  <span className="landing-card-note-index">0{index + 1}</span>
                  <span><strong>{note.title}</strong><small>{note.subject.replace(/([A-Z])/g, ' $1').trim()} · {note.unit}</small></span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="landing-section landing-browse" aria-labelledby="browse-heading">
          <div className="landing-section-heading">
            <div>
              <p className="landing-eyebrow">A library made for momentum</p>
              <h2 id="browse-heading">Choose a subject. Find your next idea.</h2>
            </div>
            <Link href="/library" className="landing-text-link">View all notes <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className="landing-subject-grid">
            {subjects.map((subject, index) => {
              const details = SUBJECT_DETAILS[subject] ?? {
                label: subject.replace(/([A-Z])/g, ' $1').trim(),
                description: 'Browse the concepts and revision material for this subject.',
              };
              const count = subjectCount(subject);
              return (
                <Link
                  key={subject}
                  href={`/search?subject=${encodeURIComponent(subject)}`}
                  className="landing-subject-card"
                >
                  <div className="landing-subject-card-top">
                    <span className="landing-subject-number">0{index + 1}</span>
                    <span className="landing-subject-icon"><LibraryBig size={21} aria-hidden="true" /></span>
                  </div>
                  <h3>{details.label}</h3>
                  <p>{details.description}</p>
                  <span className="landing-subject-footer"><span>{count} note{count === 1 ? '' : 's'}</span><ArrowRight size={17} aria-hidden="true" /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="landing-section landing-method" aria-labelledby="method-heading">
          <div className="landing-method-intro">
            <p className="landing-eyebrow">A better revision rhythm</p>
            <h2 id="method-heading">From question to understanding in three calm steps.</h2>
            <p>Use the portal the way you actually study: locate a concept, read without distraction, then follow the connected material in the same unit.</p>
          </div>
          <ol className="landing-steps">
            <li>
              <span className="landing-step-icon"><Search size={20} aria-hidden="true" /></span>
              <span className="landing-step-number">01</span>
              <h3>Find the concept</h3>
              <p>Search by a topic, subject, unit, tag, or difficulty level.</p>
            </li>
            <li>
              <span className="landing-step-icon"><BookOpenCheck size={20} aria-hidden="true" /></span>
              <span className="landing-step-number">02</span>
              <h3>Read with context</h3>
              <p>Use the table of contents, examples, and linked syllabus references to stay oriented.</p>
            </li>
            <li>
              <span className="landing-step-icon"><LibraryBig size={20} aria-hidden="true" /></span>
              <span className="landing-step-number">03</span>
              <h3>Keep momentum</h3>
              <p>Move through related notes and return to the library whenever you need a broader view.</p>
            </li>
          </ol>
        </section>

        <section className="landing-cta" aria-labelledby="cta-heading">
          <div>
            <p className="landing-eyebrow">Start with a focused session</p>
            <h2 id="cta-heading">The next useful note is already here.</h2>
            <p>Open the full library or search directly for the topic you want to understand today.</p>
          </div>
          <div className="landing-actions">
            <Link href="/library" className="landing-btn landing-btn-primary">Open study library <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link href="/search" className="landing-btn landing-btn-ghost">Search notes</Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
