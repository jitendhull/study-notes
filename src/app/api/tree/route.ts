import { NextResponse } from 'next/server';
import { getAllNotes, buildTree } from '@/lib/notes';

export const revalidate = 3600; // CDN cache 1hr

export async function GET() {
  const notes = getAllNotes();
  const tree = buildTree(notes);
  return NextResponse.json(tree, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
