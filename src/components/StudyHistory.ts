export const STUDY_HISTORY_KEY = 'study-notes:recent-study';
export const STUDY_HISTORY_EVENT = 'study-notes:recent-study-updated';
const MAX_RECENT_NOTES = 5;

export type RecentStudy = {
  id: string;
  title: string;
  subject: string;
  unit: string;
  visitedAt: number;
};

export function getRecentStudy(): RecentStudy[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = JSON.parse(window.localStorage.getItem(STUDY_HISTORY_KEY) ?? '[]');
    if (!Array.isArray(stored)) return [];

    return stored.filter((item): item is RecentStudy => (
      typeof item?.id === 'string'
      && typeof item?.title === 'string'
      && typeof item?.subject === 'string'
      && typeof item?.unit === 'string'
      && typeof item?.visitedAt === 'number'
    )).slice(0, MAX_RECENT_NOTES);
  } catch {
    return [];
  }
}

export function recordStudy(note: Omit<RecentStudy, 'visitedAt'>) {
  if (typeof window === 'undefined') return;

  const next = [
    { ...note, visitedAt: Date.now() },
    ...getRecentStudy().filter(item => item.id !== note.id),
  ].slice(0, MAX_RECENT_NOTES);

  window.localStorage.setItem(STUDY_HISTORY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STUDY_HISTORY_EVENT));
}
