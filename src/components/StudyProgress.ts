export const STUDY_PROGRESS_KEY = 'study-notes:reading-progress';
export const STUDY_PROGRESS_EVENT = 'study-notes:reading-progress-updated';

export type StudyProgressMap = Record<string, number>;

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getStudyProgress(): StudyProgressMap {
  if (typeof window === 'undefined') return {};

  try {
    const stored = JSON.parse(window.localStorage.getItem(STUDY_PROGRESS_KEY) ?? '{}');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};

    return Object.fromEntries(
      Object.entries(stored).flatMap(([id, value]) => (
        typeof value === 'number' && Number.isFinite(value)
          ? [[id, clampProgress(value)]]
          : []
      )),
    );
  } catch {
    return {};
  }
}

export function getNoteProgress(noteId: string) {
  return getStudyProgress()[noteId] ?? 0;
}

export function recordNoteProgress(noteId: string, value: number) {
  if (typeof window === 'undefined') return;

  const current = getStudyProgress();
  const nextValue = Math.max(current[noteId] ?? 0, clampProgress(value));
  if (current[noteId] === nextValue) return;

  const next = { ...current, [noteId]: nextValue };
  window.localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STUDY_PROGRESS_EVENT));
}

export function getCompletionForNotes(noteIds: string[]) {
  if (noteIds.length === 0) return { completed: 0, total: 0, percentage: 0 };

  const progress = getStudyProgress();
  const completed = noteIds.filter(id => (progress[id] ?? 0) >= 90).length;
  return {
    completed,
    total: noteIds.length,
    percentage: Math.round((completed / noteIds.length) * 100),
  };
}
