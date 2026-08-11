// Note parser: walks content/ vault, parses frontmatter, builds NoteMeta[]
// Runs at build time (SSG) and in webhook handler. Never in browser.

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { NoteMeta, NoteTree, SiteMetadata } from '@/types';

const CONTENT_DIR = path.join(process.cwd(), 'content', '2026-Sem-1');

// filepath → URL-safe id: "Mathematics/SetTheory/01-Set.md" → "Mathematics/SetTheory/01-Set"
function toId(relPath: string): string {
  return relPath.replace(/\.md$/, '');
}

function walkDir(dir: string, results: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, results);
    else if (entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

export function getAllNotes(): NoteMeta[] {
  const files = walkDir(CONTENT_DIR);
  const notes: NoteMeta[] = [];

  for (const full of files) {
    const relPath = path.relative(CONTENT_DIR, full);
    const raw = fs.readFileSync(full, 'utf-8');
    const { data, content: body } = matter(raw);

    notes.push({
      id: toId(relPath),
      title: data.title || path.basename(relPath, '.md'),
      subject: data.subject || 'General',
      semester: data.semester || '2026-Sem-1',
      unit: data.unit || 'Notes',
      tags: Array.isArray(data.tags) ? data.tags : [],
      difficulty: data.difficulty || 'intermediate',
      dateCreated: data.dateCreated ? String(data.dateCreated) : '',
      dateUpdated: data.dateUpdated ? String(data.dateUpdated) : '',
      wordCount: body.split(/\s+/).filter(Boolean).length,
      filePath: relPath,
    });
  }

  return notes;
}

export function getNoteRaw(id: string): { meta: NoteMeta; body: string } | null {
  const full = path.join(CONTENT_DIR, id + '.md');
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, 'utf-8');
  const { data, content: body } = matter(raw);
  const relPath = id + '.md';

  const meta: NoteMeta = {
    id,
    title: data.title || path.basename(id),
    subject: data.subject || 'General',
    semester: data.semester || '2026-Sem-1',
    unit: data.unit || 'Notes',
    tags: Array.isArray(data.tags) ? data.tags : [],
    difficulty: data.difficulty || 'intermediate',
    dateCreated: data.dateCreated ? String(data.dateCreated) : '',
    dateUpdated: data.dateUpdated ? String(data.dateUpdated) : '',
    wordCount: body.split(/\s+/).filter(Boolean).length,
    filePath: relPath,
  };

  return { meta, body };
}

export function buildTree(notes: NoteMeta[]): NoteTree {
  const tree: NoteTree = {};
  for (const n of notes) {
    const sem = n.semester;
    const subj = n.subject;
    const unit = n.unit;
    tree[sem] ??= {};
    tree[sem][subj] ??= {};
    tree[sem][subj][unit] ??= [];
    tree[sem][subj][unit].push(n);
  }
  // sort notes within each unit by id (filename order = numeric prefix order)
  for (const sem of Object.values(tree))
    for (const subj of Object.values(sem))
      for (const unit of Object.values(subj))
        unit.sort((a, b) => a.id.localeCompare(b.id));
  return tree;
}

export function buildSiteMetadata(notes: NoteMeta[]): SiteMetadata {
  const subjects = [...new Set(notes.map(n => n.subject))].sort();
  const semesters = [...new Set(notes.map(n => n.semester))].sort().reverse();
  const tags = [...new Set(notes.flatMap(n => n.tags))].sort();
  const units = [...new Set(notes.map(n => n.unit))].sort();
  return {
    subjects,
    semesters,
    tags,
    units,
    stats: {
      totalNotes: notes.length,
      lastUpdated: new Date().toISOString(),
    },
  };
}
