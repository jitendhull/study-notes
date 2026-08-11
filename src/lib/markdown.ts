// Markdown → HTML pipeline. Server-side only.
// Processor is memoized per unique note set (same IDs = same instance).
// Handles: GFM, KaTeX math, wikilinks, syntax highlight, sanitize XSS.

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkWikiLink from 'remark-wiki-link';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import type { NoteMeta } from '@/types';

// KaTeX + highlight.js class/style attrs must survive sanitize
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className', 'style', 'aria-hidden'],
    span: [...(defaultSchema.attributes?.['span'] ?? []), 'className', 'style'],
    div: [...(defaultSchema.attributes?.['div'] ?? []), 'className', 'style'],
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _cachedKey = '';
let _cachedProcessor: any = null;

function buildProcessor(allNotes: NoteMeta[]): any {
  // basename → full id  (for wikilink resolution)
  const byBasename = new Map<string, string>();
  for (const n of allNotes) {
    byBasename.set(n.id.split('/').pop()!, n.id);
  }

  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkWikiLink, {
      hrefTemplate: (name: string) => {
        const found = byBasename.get(name);
        return found ? `/note/${found}` : `/note/${name}`;
      },
      pageResolver: (name: string) => [name],
      aliasDivider: '|',
    })
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeSanitize, sanitizeSchema as Parameters<typeof rehypeSanitize>[0])
    .use(rehypeStringify);
}

function getProcessor(allNotes: NoteMeta[]): any {
  const key = allNotes.map(n => n.id).sort().join('|');
  if (key !== _cachedKey || !_cachedProcessor) {
    _cachedKey = key;
    _cachedProcessor = buildProcessor(allNotes);
  }
  return _cachedProcessor;
}

export async function renderMarkdown(body: string, allNotes: NoteMeta[]): Promise<string> {
  const result = await getProcessor(allNotes).process(body);
  return String(result);
}
