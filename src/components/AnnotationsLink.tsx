'use client';

import Link from 'next/link';
import { FilePenLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ANNOTATIONS_EVENT, getAnnotationCount } from '@/components/AnnotationStorage';

export function AnnotationsLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getAnnotationCount());
    sync();
    window.addEventListener(ANNOTATIONS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(ANNOTATIONS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return (
    <Link href="/annotations" className="sidebar-quick-link annotation-link">
      <FilePenLine size={14} aria-hidden="true" />
      <span>My annotations</span>
      <span className="annotation-count" aria-label={`${count} saved annotations`}>{count}</span>
    </Link>
  );
}
