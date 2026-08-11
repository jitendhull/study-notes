import type { SearchDoc } from '@/lib/search';
import { makeSnippet } from '@/lib/search';

export interface SearchFilters {
  subject?: string;
  unit?: string;
  tag?: string;
  difficulty?: string;
}

export interface IndexedSearchResult {
  id: string;
  title: string;
  subject: string;
  unit: string;
  difficulty: string;
  tags: string[];
  snippet: string;
}

type SearchIndex = {
  search: (query: string, options: object) => Array<{ result: string[] }>;
  docs: Map<string, SearchDoc>;
};

let indexCache: SearchIndex | null = null;
let indexLoading: Promise<void> | null = null;

export async function loadSearchIndex(): Promise<void> {
  if (indexCache) return;
  if (indexLoading) return indexLoading;

  indexLoading = (async () => {
    try {
      const [{ Document }, response] = await Promise.all([
        import('flexsearch'),
        fetch('/search-index.json'),
      ]);
      if (!response.ok) throw new Error(`Search index failed to load (${response.status})`);

      const docs: SearchDoc[] = await response.json();
      const index = new Document({
        document: { id: 'id', index: ['title', 'subject', 'unit', 'tags', 'body'] },
        tokenize: 'forward',
      });
      const documents = new Map<string, SearchDoc>();

      for (const doc of docs) {
        // FlexSearch's generic document type does not infer the serialized index schema.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        index.add(doc as any);
        documents.set(doc.id, doc);
      }

      indexCache = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        search: index.search.bind(index) as any,
        docs: documents,
      };
    } finally {
      indexLoading = null;
    }
  })();

  return indexLoading;
}

function matchesFilters(doc: SearchDoc, filters: SearchFilters): boolean {
  const tags = doc.tags.toLowerCase().split(/\s+/).filter(Boolean);
  return (
    (!filters.subject || doc.subject === filters.subject) &&
    (!filters.unit || doc.unit === filters.unit) &&
    (!filters.difficulty || doc.difficulty === filters.difficulty) &&
    (!filters.tag || tags.includes(filters.tag.toLowerCase()))
  );
}

export async function searchNotes(
  query: string,
  filters: SearchFilters = {},
  limit = 30,
): Promise<IndexedSearchResult[]> {
  await loadSearchIndex();
  const index = indexCache!;
  const normalizedQuery = query.trim();

  let found: SearchDoc[];
  if (normalizedQuery) {
    const hits = index.search(normalizedQuery, { limit, enrich: false });
    const ids = new Set<string>();
    hits.forEach(hit => hit.result.forEach(id => ids.add(id)));
    found = [...ids].map(id => index.docs.get(id)).filter((doc): doc is SearchDoc => Boolean(doc));
  } else {
    found = [...index.docs.values()];
  }

  return found
    .filter(doc => matchesFilters(doc, filters))
    .slice(0, limit)
    .map(doc => ({
      id: doc.id,
      title: doc.title,
      subject: doc.subject,
      unit: doc.unit,
      difficulty: doc.difficulty,
      tags: doc.tags.split(/\s+/).filter(Boolean),
      snippet: makeSnippet(doc.body, normalizedQuery),
    }));
}
