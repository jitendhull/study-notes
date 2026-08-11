'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { NoteTree } from '@/types';

interface Props {
  tree: NoteTree;
  currentId?: string;
}

export function Sidebar({ tree, currentId }: Props) {
  const semesters = Object.keys(tree).sort().reverse();

  return (
    <nav
      aria-label="Note navigation"
      style={{
        overflowY: 'auto',
        height: '100%',
        padding: '1rem 0',
        fontSize: '0.875rem',
      }}
    >
      {semesters.map(sem => (
        <SemesterSection key={sem} semester={sem} subjects={tree[sem]} currentId={currentId} />
      ))}
    </nav>
  );
}

function SemesterSection({ semester, subjects, currentId }: {
  semester: string;
  subjects: NoteTree[string];
  currentId?: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          padding: '6px 16px', cursor: 'pointer', fontWeight: 700,
          color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase',
          letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between',
        }}
      >
        {semester} <span>{open ? '▾' : '▸'}</span>
      </button>
      {open && Object.keys(subjects).sort().map(subj => (
        <SubjectSection key={subj} subject={subj} units={subjects[subj]} currentId={currentId} />
      ))}
    </div>
  );
}

function SubjectSection({ subject, units, currentId }: {
  subject: string;
  units: NoteTree[string][string];
  currentId?: string;
}) {
  const [open, setOpen] = useState(true);
  const label = subject.replace(/([A-Z])/g, ' $1').trim();
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          padding: '5px 16px 5px 24px', cursor: 'pointer', fontWeight: 600,
          color: 'var(--text-primary)', fontSize: '0.85rem', display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {label} <span style={{ color: 'var(--text-tertiary)' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && Object.keys(units).sort().map(unit => (
        <UnitSection key={unit} unit={unit} notes={units[unit]} currentId={currentId} />
      ))}
    </div>
  );
}

function UnitSection({ unit, notes, currentId }: {
  unit: string;
  notes: NoteTree[string][string][string];
  currentId?: string;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        padding: '4px 16px 4px 32px', fontSize: '0.75rem',
        color: 'var(--text-tertiary)', fontWeight: 500,
      }}>
        {unit}
      </div>
      {notes.map(note => (
        <Link
          key={note.id}
          href={`/note/${note.id}`}
          style={{
            display: 'block', padding: '3px 16px 3px 40px',
            color: currentId === note.id ? 'var(--accent)' : 'var(--text-secondary)',
            background: currentId === note.id ? 'var(--accent-light)' : 'transparent',
            fontSize: '0.825rem', lineHeight: 1.4, borderRadius: 'var(--radius)',
            margin: '0 8px',
          }}
          aria-current={currentId === note.id ? 'page' : undefined}
        >
          {note.title}
        </Link>
      ))}
    </div>
  );
}
