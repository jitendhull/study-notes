import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllNotes, buildTree, buildSiteMetadata } from '@/lib/notes';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Study Notes — MDU BCA Semester I',
  description: 'Free, searchable BCA study notes for Mathematics, Problem Solving, Computer Architecture, and more.',
};

const SUBJECT_ICONS: Record<string, string> = {
  Mathematics: '∑',
  ProblemSolving: '🧩',
  ComputerArchitecture: '⚙️',
  GeneralEnglish: '📝',
  IndianKnowledgeSystem: '🪔',
  EnvironmentalScience: '🌿',
};

export default function HomePage() {
  const notes = getAllNotes();
  const tree = buildTree(notes);
  const meta = buildSiteMetadata(notes);
  const subjects = meta.subjects.filter(s => s !== 'General');

  return (
    <PageShell tree={tree}>
      <section className="home-hero" aria-labelledby="home-title">
        <p className="hero-eyebrow">MDU · BCA · Semester I</p>
        <h1 id="home-title" className="hero-title">Study notes, organized for clarity.</h1>
        <p className="hero-sub">{meta.stats.totalNotes} curated notes across {subjects.length} subjects, ready whenever you need a focused revision session.</p>
      </section>

      <div className="stats-row" aria-label="Study-note statistics">
        {[
          { label: 'Notes', value: meta.stats.totalNotes },
          { label: 'Subjects', value: subjects.length },
          { label: 'Semesters', value: meta.semesters.length },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="subject-section" aria-labelledby="subjects-heading">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Browse by subject</p>
            <h2 id="subjects-heading" className="section-title">Start where you are studying</h2>
          </div>
        </div>
        <div className="subject-grid">
        {subjects.map(subj => {
          const count = Object.values(tree).flatMap(sem =>
            Object.values(sem[subj] ?? {}).flat()
          ).length;
          return (
            <Link
              key={subj}
              href={`/search?subject=${encodeURIComponent(subj)}`}
              className="subject-card"
            >
              <div className="subject-icon">{SUBJECT_ICONS[subj] ?? '📖'}</div>
              <div className="subject-name">{subj.replace(/([A-Z])/g, ' $1').trim()}</div>
              <div className="subject-count">{count} note{count !== 1 ? 's' : ''}</div>
            </Link>
          );
        })}
        </div>
      </section>
    </PageShell>
  );
}
