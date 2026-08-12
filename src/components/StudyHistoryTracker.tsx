'use client';

import { useEffect } from 'react';
import { recordStudy } from '@/components/StudyHistory';

type StudyHistoryTrackerProps = {
  id: string;
  title: string;
  subject: string;
  unit: string;
};

export function StudyHistoryTracker({ id, title, subject, unit }: StudyHistoryTrackerProps) {
  useEffect(() => {
    recordStudy({ id, title, subject, unit });
  }, [id, title, subject, unit]);

  return null;
}
