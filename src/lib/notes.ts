// Note parser — single-parse, module-level cache.
// getAllNotes() walks + parses the vault ONCE per process.
// All derived structures (tree, meta, id→body map) computed once from that.
// Safe for SSG: Next.js builds are single-process, cache never goes stale mid-build.

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { NoteMeta, NoteTree, SiteMetadata } from '@/types';

const CONTENT_DIR = path.join(process.cwd(), 'content', '2026-Sem-1');

// Module-level cache — parsed once per build process.
let _notes: NoteMeta[] | null = null;
let _bodies: Map<string, string> | null = null; // id → raw markdown body

function toId(relPath: string): string {
  return relPath.replace(/\.md$/, '');
}

function walkDir(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, out);
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function parseMeta(data: Record<string, unknown>, id: string, body: string): NoteMeta {
  return {
    id,
    title: String(data.title ?? path.basename(id)),
    subject: String(data.subject ?? 'General'),
    semester: String(data.semester ?? '2026-Sem-1'),
    unit: String(data.unit ?? 'Notes'),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    difficulty: (data.difficulty as NoteMeta['difficulty']) ?? 'intermediate',
    dateCreated: data.dateCreated ? String(data.dateCreated) : '',
    dateUpdated: data.dateUpdated ? String(data.dateUpdated) : '',
    wordCount: body.split(/\s+/).filter(Boolean).length,
    filePath: id + '.md',
  };
}

// Single walk, single parse, fills both caches.
function hydrate(): void {
  if (_notes) return;
  const files = walkDir(CONTENT_DIR);
  const notes: NoteMeta[] = [];
  const bodies = new Map<string, string>();

  for (const full of files) {
    const relPath = path.relative(CONTENT_DIR, full);
    const id = toId(relPath);
    const raw = fs.readFileSync(full, 'utf-8');
    const { data, content: body } = matter(raw);
    notes.push(parseMeta(data as Record<string, unknown>, id, body));
    bodies.set(id, body);
  }

  _notes = notes;
  _bodies = bodies;
}

export function getAllNotes(): NoteMeta[] {
  hydrate();
  return _notes!;
}

// Returns meta + body from cache — no fs read after first hydrate().
export function getNoteRaw(id: string): { meta: NoteMeta; body: string } | null {
  hydrate();
  const meta = _notes!.find(n => n.id === id);
  if (!meta) return null;
  const body = _bodies!.get(id) ?? '';
  return { meta, body };
}

// Expose bodies map for search index builder
export function getAllBodies(): Map<string, string> {
  hydrate();
  return _bodies!;
}

export function buildTree(notes: NoteMeta[]): NoteTree {
  const tree: NoteTree = {};
  for (const n of notes) {
    tree[n.semester] ??= {};
    tree[n.semester][n.subject] ??= {};
    tree[n.semester][n.subject][n.unit] ??= [];
    tree[n.semester][n.subject][n.unit].push(n);
  }
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
    stats: { totalNotes: notes.length, lastUpdated: new Date().toISOString() },
  };
}
