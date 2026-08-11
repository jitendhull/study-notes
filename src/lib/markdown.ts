// Markdown → HTML pipeline
// unified + remark + rehype, server-side only.
// Handles: GFM tables/strikethrough, KaTeX math ($...$, $$...$$), wikilinks, syntax highlight, sanitize.

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

// Allow KaTeX-generated class/style attributes through sanitize
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className', 'style', 'aria-hidden'],
    span: [...(defaultSchema.attributes?.['span'] ?? []), 'className', 'style'],
    div: [...(defaultSchema.attributes?.['div'] ?? []), 'className', 'style'],
  },
};

// wikilink [[01-Set]] → /note/Mathematics/SetTheory/01-Set
// We resolve by searching allNotes for matching id basename
function makeWikilinkResolver(allNotes: NoteMeta[]) {
  // basename → full id map (last segment of id)
  const byBasename = new Map<string, string>();
  for (const n of allNotes) {
    const base = n.id.split('/').pop()!;
    byBasename.set(base, n.id);
  }
  return (name: string) => {
    const found = byBasename.get(name);
    return found ? `/note/${found}` : `/note/${name}`;
  };
}

const processor = (allNotes: NoteMeta[]) =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkWikiLink, {
      hrefTemplate: makeWikilinkResolver(allNotes),
      pageResolver: (name: string) => [name],
      aliasDivider: '|',
    })
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeSanitize, sanitizeSchema as Parameters<typeof rehypeSanitize>[0])
    .use(rehypeStringify);

export async function renderMarkdown(body: string, allNotes: NoteMeta[]): Promise<string> {
  const result = await processor(allNotes).process(body);
  return String(result);
}
