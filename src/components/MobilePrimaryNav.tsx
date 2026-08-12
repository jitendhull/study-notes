'use client';

import Link from 'next/link';
import { Bookmark, FolderTree, Home, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSavedNoteIds, READING_LIST_EVENT } from '@/components/BookmarkButton';

const items = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/#subjects-heading', label: 'Subjects', icon: FolderTree },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/saved', label: 'Saved', icon: Bookmark },
];

export function MobilePrimaryNav() {
  const pathname = usePathname();
  const [savedCount, setSavedCount] = useState(0);
  const [hash, setHash] = useState('');

  useEffect(() => {
    const sync = () => setSavedCount(getSavedNoteIds().length);
    sync();
    window.addEventListener(READING_LIST_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(READING_LIST_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  return (
    <nav className="mobile-primary-nav" aria-label="Primary study navigation">
      {items.map(({ href, label, icon: Icon }) => {
        const active = label === 'Home'
          ? pathname === '/' && hash !== '#subjects-heading'
          : label === 'Subjects'
            ? pathname === '/' && hash === '#subjects-heading'
            : pathname === href;
        const isSaved = label === 'Saved';
        return (
          <Link key={label} href={href} className={`mobile-primary-nav-link${active ? ' mobile-primary-nav-link-active' : ''}`} aria-current={active ? 'page' : undefined} onClick={() => label === 'Subjects' && setHash('#subjects-heading')}>
            <span className="mobile-primary-nav-icon">
              <Icon size={19} strokeWidth={active ? 2.25 : 1.9} aria-hidden="true" />
              {isSaved && savedCount > 0 && <span className="mobile-primary-nav-count" aria-label={`${savedCount} saved notes`}>{savedCount > 9 ? '9+' : savedCount}</span>}
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
