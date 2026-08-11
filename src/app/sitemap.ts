// Next.js sitemap.ts — auto-generated from all notes
import type { MetadataRoute } from 'next';
import { getAllNotes } from '@/lib/notes';

const host = '';

export default function sitemap(): MetadataRoute.Sitemap {
  const notes = getAllNotes();
  const noteUrls: MetadataRoute.Sitemap = notes.map(n => ({
    url: `${host}/note/${n.id}`,
    lastModified: n.dateUpdated || new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    { url: host || '/', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${host}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...noteUrls,
  ];
}
