import fs from 'fs';
import path from 'path';

let fail = 0;
function check(label: string, cond: boolean, detail = '') {
  console.log((cond ? '✅ ' : '❌ ') + label + (detail ? ' — ' + detail : ''));
  if (!cond) fail++;
}

const files = [
  'src/lib/notes.ts',
  'src/lib/markdown.ts',
  'src/lib/search.ts',
  'src/lib/analytics.ts',
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/app/not-found.tsx',
  'src/app/global-error.tsx',
  'src/app/globals.css',
  'src/app/note/[...slug]/page.tsx',
  'src/app/search/page.tsx',
  'src/app/api/webhook/route.ts',
  'src/app/api/tree/route.ts',
  'src/app/api/metadata/route.ts',
  'src/app/sitemap.ts',
  'src/components/PageShell.tsx',
  'src/components/ThemeToggle.tsx',
  'src/components/MobileMenuToggle.tsx',
  'src/components/SearchClient.tsx',
  'netlify.toml',
  '.gitmodules',
  'scripts/build-search-index.mjs',
];
files.forEach(f => check('file: ' + f, fs.existsSync(path.join(process.cwd(), f))));

check('old Header.tsx removed', !fs.existsSync('src/components/Header.tsx'));
check('old Sidebar.tsx removed', !fs.existsSync('src/components/Sidebar.tsx'));
check('.next exists', fs.existsSync('.next'));
check('.next/server/app exists', fs.existsSync('.next/server/app'));
check('index.html SSG', fs.existsSync('.next/server/app/index.html'));
check('sitemap.xml.body', fs.existsSync('.next/server/app/sitemap.xml.body'));
check('note pages SSG', fs.readdirSync('.next/server/app/note/Mathematics/SetTheory').length > 0);

const idx = JSON.parse(fs.readFileSync('public/search-index.json', 'utf-8'));
check('search: 8 docs', idx.length === 8);
const VALID = ['Mathematics','ProblemSolving','ComputerArchitecture','GeneralEnglish','IndianKnowledgeSystem','EnvironmentalScience','General'];
check('search: valid subjects', idx.every((d: any) => VALID.includes(d.subject)));
check('search: no spaces in IDs', idx.every((d: any) => !d.id.includes(' ')));

const ps = fs.readFileSync('src/components/PageShell.tsx', 'utf-8');
check('PageShell: uses className not style', ps.includes('className=') && !ps.includes('style={{'));

const css = fs.readFileSync('src/app/globals.css', 'utf-8');
check('CSS: mobile-only class', css.includes('.mobile-only'));
check('CSS: data-sidebar-open toggle', css.includes('[data-sidebar-open]'));
check('CSS: sidebar sticky', css.includes('position: sticky'));
check('CSS: no inline display:none in PageShell', !ps.includes('display: none'));

const sc = fs.readFileSync('src/components/SearchClient.tsx', 'utf-8');
check('SearchClient: module-level cache', sc.includes('_indexCache'));
check('SearchClient: skeleton loading', sc.includes('skeleton'));

const md = fs.readFileSync('src/lib/markdown.ts', 'utf-8');
check('markdown: processor memoized', md.includes('_cachedProcessor'));

const notes = fs.readFileSync('src/lib/notes.ts', 'utf-8');
check('notes: module-level cache', notes.includes('_notes'));

const wh = fs.readFileSync('src/app/api/webhook/route.ts', 'utf-8');
check('webhook: timingSafeEqual', wh.includes('timingSafeEqual'));

check('PageShell: server component (no use client)', !ps.startsWith("'use client'") && !ps.includes("'use client'"));
check('CSS: dark mode vars', css.includes('[data-theme='));

console.log(fail === 0 ? '\n✅ ALL CHECKS PASSED' : '\n❌ ' + fail + ' FAILED');
process.exit(fail ? 1 : 0);
