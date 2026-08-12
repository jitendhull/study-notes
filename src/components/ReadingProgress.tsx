'use client';

import { useEffect, useRef, useState } from 'react';
import { getNoteProgress, recordNoteProgress } from '@/components/StudyProgress';

export function ReadingProgress({ noteId }: { noteId: string }) {
  const [progress, setProgress] = useState(0);
  const lastRecordedRef = useRef(0);

  useEffect(() => {
    lastRecordedRef.current = getNoteProgress(noteId);

    const updateProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const next = scrollableHeight <= 0
        ? 100
        : Math.max(0, Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100)));

      setProgress(next);
      const furthest = Math.max(lastRecordedRef.current, next);
      if (furthest !== lastRecordedRef.current) {
        lastRecordedRef.current = furthest;
        recordNoteProgress(noteId, furthest);
      }
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [noteId]);

  return (
    <div
      className="reading-progress"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <span className="reading-progress-track" aria-hidden="true">
        <span className="reading-progress-value" style={{ transform: `scaleX(${progress / 100})` }} />
      </span>
      <span className="reading-progress-label">{progress}% read</span>
    </div>
  );
}
