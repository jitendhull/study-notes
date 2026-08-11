import { NextResponse } from 'next/server';
import { getAllNotes, buildSiteMetadata } from '@/lib/notes';

export const revalidate = 300;

export async function GET() {
  const notes = getAllNotes();
  const meta = buildSiteMetadata(notes);
  return NextResponse.json(meta, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
