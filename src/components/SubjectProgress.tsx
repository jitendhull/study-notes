'use client';

import { useEffect, useState } from 'react';
import { getCompletionForNotes, STUDY_PROGRESS_EVENT } from '@/components/StudyProgress';

interface Props {
  subject: string;
  noteIds: string[];
}

export function SubjectProgress({ subject, noteIds }: Props) {
  const [completion, setCompletion] = useState({ completed: 0, total: noteIds.length, percentage: 0 });

  useEffect(() => {
    const sync = () => setCompletion(getCompletionForNotes(noteIds));
    sync();
    window.addEventListener(STUDY_PROGRESS_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(STUDY_PROGRESS_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [noteIds]);

  if (completion.total === 0) return null;

  const subjectLabel = subject.replace(/([A-Z])/g, ' $1').trim();
  return (
    <section className="subject-progress" aria-label={`${subjectLabel} completion`}>
      <div className="subject-progress-copy">
        <span>Study progress</span>
        <strong>{completion.completed} of {completion.total} notes completed</strong>
      </div>
      <div
        className="subject-progress-bar"
        role="progressbar"
        aria-label={`${subjectLabel} completion`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completion.percentage}
      >
        <span style={{ transform: `scaleX(${completion.percentage / 100})` }} />
      </div>
    </section>
  );
}
