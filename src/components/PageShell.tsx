// Pure server component — renders the document tree and app frame server-side.

import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileMenuToggle } from '@/components/MobileMenuToggle';
import { CommandPalette } from '@/components/CommandPalette';
import { ReadingListLink } from '@/components/ReadingListLink';
import { AnnotationsLink } from '@/components/AnnotationsLink';
import { MobilePrimaryNav } from '@/components/MobilePrimaryNav';
import { RouteTransition } from '@/components/RouteTransition';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import type { NoteTree } from '@/types';

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
      {notes.map(note => <NoteLink key={note.id} id={note.id} title={note.title} currentId={currentId} />)}
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
      {Object.keys(units).sort().map(unit => <UnitGroup key={unit} unit={unit} notes={units[unit]} currentId={currentId} />)}
    </details>
  );
}

function SidebarNav({ tree, currentId }: { tree: NoteTree; currentId?: string }) {
  const semesters = Object.keys(tree).sort().reverse();
  return (
    <nav aria-label="Study note document tree" className="sidebar-nav">
      <div className="sidebar-quick-links">
        <Link href="/library" className="sidebar-quick-link">Browse the catalogue</Link>
        <Link href="/search" className="sidebar-quick-link">Search every note</Link>
        <ReadingListLink />
        <AnnotationsLink />
      </div>
      {semesters.map(semester => (
        <section key={semester} className="nav-semester" aria-label={semester}>
          <div className="nav-semester-label">{semester}</div>
          {Object.keys(tree[semester]).sort().map(subject => (
            <SubjectGroup key={subject} subject={subject} units={tree[semester][subject]} currentId={currentId} />
          ))}
        </section>
      ))}
    </nav>
  );
}

function HeaderBar() {
  return (
    <header className="header">
      <MobileMenuToggle />
      <Link href="/" className="header-logo">
        <span className="header-logo-name">Study Notes</span>
        <span className="header-logo-edition">BCA · Semester I</span>
      </Link>
      <Link href="/library" className="header-library-link">Catalogue</Link>
      <CommandPalette />
      <KeyboardShortcuts />
      <ThemeToggle />
    </header>
  );
}

export function PageShell({ tree, currentId, children }: {
  tree: NoteTree;
  currentId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="layout" id="layout-root">
      <div className="layout-header"><HeaderBar /></div>
      <aside className="layout-sidebar" id="sidebar"><SidebarNav tree={tree} currentId={currentId} /></aside>
      <main className="layout-main"><RouteTransition>{children}</RouteTransition></main>
      <MobilePrimaryNav />
    </div>
  );
}
