// Pure server component — no 'use client'.
// Renders layout structure, sidebar, and main content server-side.
// Only the interactive islands (ThemeToggle, MobileToggle) are client.

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileMenuToggle } from '@/components/MobileMenuToggle';
import { CommandPalette } from '@/components/CommandPalette';
import { BookOpen, LibraryBig } from 'lucide-react';
import type { NoteTree } from '@/types';

// ── Sidebar tree (pure server) ────────────────────────────────

function NoteLink({ id, title, currentId }: { id: string; title: string; currentId?: string }) {
  const active = currentId === id;
  return (
    <Link
      href={`/note/${id}`}
      className={`nav-note${active ? ' nav-note-active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {title}
    </Link>
  );
}

function UnitGroup({ unit, notes, currentId }: {
  unit: string;
  notes: NoteTree[string][string][string];
  currentId?: string;
}) {
  return (
    <div className="nav-unit-group">
      <div className="nav-unit-label">{unit}</div>
      {notes.map(n => (
        <NoteLink key={n.id} id={n.id} title={n.title} currentId={currentId} />
      ))}
    </div>
  );
}

function SubjectGroup({ subject, units, currentId }: {
  subject: string;
  units: NoteTree[string][string];
  currentId?: string;
}) {
  const label = subject.replace(/([A-Z])/g, ' $1').trim();
  return (
    <details className="nav-subject" open>
      <summary className="nav-subject-label">{label}</summary>
      {Object.keys(units).sort().map(unit => (
        <UnitGroup key={unit} unit={unit} notes={units[unit]} currentId={currentId} />
      ))}
    </details>
  );
}

function SidebarNav({ tree, currentId }: { tree: NoteTree; currentId?: string }) {
  const semesters = Object.keys(tree).sort().reverse();
  return (
    <nav aria-label="Note navigation" className="sidebar-nav">
      <div className="sidebar-quick-links">
        <Link href="/library" className="sidebar-quick-link"><LibraryBig size={16} aria-hidden="true" /> All notes</Link>
        <Link href="/search" className="sidebar-quick-link">Advanced search</Link>
      </div>
      {semesters.map(sem => (
        <div key={sem} className="nav-semester">
          <div className="nav-semester-label">{sem}</div>
          {Object.keys(tree[sem]).sort().map(subj => (
            <SubjectGroup
              key={subj}
              subject={subj}
              units={tree[sem][subj]}
              currentId={currentId}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

// ── Header (server shell + client islands) ────────────────────

function HeaderBar() {
  return (
    <header className="header">
      <MobileMenuToggle />
      <Link href="/" className="header-logo"><BookOpen size={18} aria-hidden="true" /><span>Study Notes</span></Link>
      <Link href="/library" className="header-library-link"><LibraryBig size={16} aria-hidden="true" /><span>Browse</span></Link>
      <CommandPalette />
      <ThemeToggle />
    </header>
  );
}

// ── Page shell (server) ───────────────────────────────────────

export function PageShell({ tree, currentId, children }: {
  tree: NoteTree;
  currentId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="layout" id="layout-root">
      <div className="layout-header">
        <HeaderBar />
      </div>
      <div className="layout-sidebar" id="sidebar">
        <SidebarNav tree={tree} currentId={currentId} />
      </div>
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}
