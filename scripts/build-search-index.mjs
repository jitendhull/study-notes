// scripts/build-search-index.mjs
// Generates public/search-index.json from vault at build time.
// Run before `next build` via prebuild hook.

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content', '2026-Sem-1');
const OUT = path.join(ROOT, 'public', 'search-index.json');

function walkDir(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, results);
    else if (entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

const files = walkDir(CONTENT);
const docs = [];

for (const full of files) {
  const rel = path.relative(CONTENT, full);
  const id = rel.replace(/\.md$/, '');
  const raw = fs.readFileSync(full, 'utf-8');
  const { data, content: body } = matter(raw);

  // Strip wikilinks and markdown syntax for clean search text
  const cleanBody = body
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1') // wikilinks
    .replace(/#{1,6}\s/g, '')                            // headings
    .replace(/[*_`~]/g, '')                              // emphasis
    .replace(/\$\$[\s\S]*?\$\$/g, '')                   // block math
    .replace(/\$[^$\n]+\$/g, '')                         // inline math
    .trim()
    .slice(0, 800);

  docs.push({
    id,
    title: data.title || path.basename(id),
    subject: data.subject || 'General',
    unit: data.unit || 'Notes',
    tags: Array.isArray(data.tags) ? data.tags.join(' ') : '',
    body: cleanBody,
    difficulty: data.difficulty || 'intermediate',
  });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(docs), 'utf-8');
console.log(`✅ Search index: ${docs.length} notes → public/search-index.json (${(fs.statSync(OUT).size / 1024).toFixed(1)}KB)`);
