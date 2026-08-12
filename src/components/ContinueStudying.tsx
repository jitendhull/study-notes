'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecentStudy, STUDY_HISTORY_EVENT, type RecentStudy } from '@/components/StudyHistory';

function formatSubject(subject: string) {
  return subject.replace(/([A-Z])/g, ' $1').trim();
}

export function ContinueStudying() {
  const [recent, setRecent] = useState<RecentStudy | null>(null);

  useEffect(() => {
    const sync = () => setRecent(getRecentStudy()[0] ?? null);
    sync();
    window.addEventListener(STUDY_HISTORY_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(STUDY_HISTORY_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!recent) {
    return (
      <section className="continue-study continue-study-empty" aria-labelledby="continue-study-heading">
        <div className="continue-study-icon" aria-hidden="true"><BookOpen size={18} /></div>
        <div className="continue-study-copy">
          <p className="catalogue-kicker">Start studying</p>
          <h2 id="continue-study-heading">Pick a subject to begin</h2>
          <p>Choose a subject and the app will keep your latest note within reach.</p>
        </div>
        <a href="#subjects-heading" className="continue-study-action">Browse subjects <ArrowRight size={16} aria-hidden="true" /></a>
      </section>
    );
  }

  return (
    <section className="continue-study" aria-labelledby="continue-study-heading">
      <div className="continue-study-icon" aria-hidden="true"><History size={18} /></div>
      <div className="continue-study-copy">
        <p className="catalogue-kicker">Continue studying</p>
        <h2 id="continue-study-heading">{recent.title}</h2>
        <p>{formatSubject(recent.subject)} · {recent.unit}</p>
      </div>
      <Link href={`/note/${recent.id}`} className="continue-study-action">Continue <ArrowRight size={16} aria-hidden="true" /></Link>
    </section>
  );
}
