'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSavedNoteIds, READING_LIST_EVENT } from '@/components/BookmarkButton';

export function ReadingListLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getSavedNoteIds().length);
    sync();
    window.addEventListener(READING_LIST_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(READING_LIST_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <Link href="/saved" className="sidebar-quick-link reading-list-link">
      <Bookmark size={13} aria-hidden="true" />
      <span>Reading list</span>
      <span className="reading-list-count" aria-label={`${count} saved notes`}>{count}</span>
    </Link>
  );
}
