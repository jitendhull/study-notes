import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllNotes, buildTree, buildSiteMetadata } from '@/lib/notes';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Study Notes — MDU BCA Semester I',
  description: 'Free, searchable BCA study notes for Mathematics, Problem Solving, Computer Architecture, and more.',
};

export default function HomePage() {
  const notes = getAllNotes();
  const tree = buildTree(notes);
  const meta = buildSiteMetadata(notes);

  const subjects = meta.subjects.filter(s => s !== 'General');

  const SUBJECT_ICONS: Record<string, string> = {
    Mathematics: '∑',
    ProblemSolving: '🧩',
    ComputerArchitecture: '⚙️',
    GeneralEnglish: '📝',
    IndianKnowledgeSystem: '🪔',
    EnvironmentalScience: '🌿',
  };

  return (
    <PageShell tree={tree}>
      {/* Hero */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>
          MDU BCA Study Notes
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem' }}>
          Semester I · {meta.stats.totalNotes} notes · {subjects.length} subjects
        </p>
      </section>

      {/* Stats */}
      <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '2rem' }}>
        {[
          { label: 'Notes', value: meta.stats.totalNotes },
          { label: 'Subjects', value: subjects.length },
          { label: 'Semesters', value: meta.semesters.length },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '12px 20px', minWidth: 100,
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Subject grid */}
      <section>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
          Subjects
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {subjects.map(subj => {
            const label = subj.replace(/([A-Z])/g, ' $1').trim();
            const count = Object.values(tree).flatMap(sem =>
              Object.values(sem[subj] ?? {}).flat()
            ).length;
            return (
              <Link
                key={subj}
                href={`/search?subject=${encodeURIComponent(subj)}`}
                style={{
                  display: 'block',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  color: 'var(--text-primary)',
                  transition: 'border-color 0.15s',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{SUBJECT_ICONS[subj] ?? '📖'}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  {count} note{count !== 1 ? 's' : ''}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
