'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDownAZ, CalendarClock, Grid2X2, List, Search, SlidersHorizontal, Tags } from 'lucide-react';
import type { NoteMeta } from '@/types';
import { BookmarkButton } from '@/components/BookmarkButton';

type ViewMode = 'grid' | 'list';
type SortMode = 'title' | 'recent' | 'length';

interface Props {
  notes: NoteMeta[];
  subjects: string[];
  units: string[];
  tags: string[];
}

function formatSubject(subject: string) {
  return subject.replace(/([A-Z])/g, ' $1').trim();
}

function formatDate(date: string) {
  if (!date) return 'No date recorded';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
}

export function NoteBrowser({ notes, subjects, units, tags }: Props) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [unit, setUnit] = useState('');
  const [tag, setTag] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState<SortMode>('title');
  const [view, setView] = useState<ViewMode>('list');

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = notes.filter(note => {
      const searchable = [note.title, note.subject, note.unit, ...note.tags].join(' ').toLowerCase();
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (!subject || note.subject === subject) &&
        (!unit || note.unit === unit) &&
        (!tag || note.tags.includes(tag)) &&
        (!difficulty || note.difficulty === difficulty)
      );
    });

    return filtered.sort((a, b) => {
      if (sort === 'recent') return (b.dateUpdated || b.dateCreated).localeCompare(a.dateUpdated || a.dateCreated);
      if (sort === 'length') return b.wordCount - a.wordCount;
      return a.title.localeCompare(b.title);
    });
  }, [difficulty, notes, query, sort, subject, tag, unit]);

  const activeFilters = [subject, unit, tag, difficulty].filter(Boolean).length;

  return (
    <section className="note-browser" aria-label="Browse all study notes">
      <div className="browser-toolbar">
        <label className="browser-query">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Filter notes</span>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter this library…" />
        </label>
        <div className="browser-view-toggle" aria-label="Choose note view">
          <button type="button" onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'is-active' : ''}><Grid2X2 size={17} aria-hidden="true" /></button>
          <button type="button" onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'is-active' : ''}><List size={18} aria-hidden="true" /></button>
        </div>
      </div>

      <div className="browser-filter-bar" aria-label="Filter all notes">
        <span className="browser-filter-label"><SlidersHorizontal size={16} aria-hidden="true" /> Filters{activeFilters ? ` (${activeFilters})` : ''}</span>
        <select value={subject} onChange={event => setSubject(event.target.value)} aria-label="Filter notes by subject"><option value="">Subject</option>{subjects.map(item => <option key={item} value={item}>{formatSubject(item)}</option>)}</select>
        <select value={unit} onChange={event => setUnit(event.target.value)} aria-label="Filter notes by unit"><option value="">Unit</option>{units.map(item => <option key={item} value={item}>{item}</option>)}</select>
        <select value={tag} onChange={event => setTag(event.target.value)} aria-label="Filter notes by tag"><option value="">Tag</option>{tags.map(item => <option key={item} value={item}>#{item}</option>)}</select>
        <select value={difficulty} onChange={event => setDifficulty(event.target.value)} aria-label="Filter notes by difficulty"><option value="">Level</option><option value="easy">Easy</option><option value="intermediate">Intermediate</option><option value="hard">Hard</option></select>
        <select value={sort} onChange={event => setSort(event.target.value as SortMode)} aria-label="Sort notes"><option value="title">A–Z</option><option value="recent">Recently updated</option><option value="length">Longest first</option></select>
      </div>

      <div className="browser-summary" role="status">
        <span>{filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} shown</span>
        {activeFilters > 0 && <button type="button" onClick={() => { setSubject(''); setUnit(''); setTag(''); setDifficulty(''); }} className="clear-filters">Clear filters</button>}
      </div>

      {filteredNotes.length > 0 ? (
        <div className={`note-browser-results note-browser-${view}`} role="list">
          {filteredNotes.map(note => (
            <div key={note.id} className="note-browser-card" role="listitem">
              <Link href={`/note/${note.id}`} className="note-browser-card-link">
                <div className="note-browser-card-top">
                  <span className={`badge badge-${note.difficulty}`}>{note.difficulty}</span>
                  <span className="note-browser-unit">{note.unit}</span>
                </div>
                <h2 className="note-browser-title">{note.title}</h2>
                <p className="note-browser-subject">{formatSubject(note.subject)}</p>
                <div className="note-browser-tags">{note.tags.slice(0, 3).map(noteTag => <span key={noteTag}>#{noteTag}</span>)}</div>
                <div className="note-browser-meta"><span><CalendarClock size={14} aria-hidden="true" /> {formatDate(note.dateUpdated || note.dateCreated)}</span><span>{note.wordCount.toLocaleString()} words</span></div>
              </Link>
              <BookmarkButton noteId={note.id} noteTitle={note.title} compact />
            </div>
          ))}
        </div>
      ) : (
        <div className="browser-empty-state">
          <Tags size={24} aria-hidden="true" />
          <h2>No notes match these filters</h2>
          <p>Try a different keyword or clear one or more filters to return to the full library.</p>
          <button type="button" onClick={() => { setQuery(''); setSubject(''); setUnit(''); setTag(''); setDifficulty(''); }}>Show all notes</button>
        </div>
      )}
    </section>
  );
}
