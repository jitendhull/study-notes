export const ANNOTATIONS_KEY = 'study-notes-annotations';
export const ANNOTATIONS_EVENT = 'study-notes-annotations-changed';

export type AnnotationMap = Record<string, string>;

export function getAnnotationMap(): AnnotationMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ANNOTATIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0);
    return Object.fromEntries(entries) as AnnotationMap;
  } catch {
    return {};
  }
}

export function getAnnotation(noteId: string): string {
  return getAnnotationMap()[noteId] ?? '';
}

export function setAnnotation(noteId: string, value: string) {
  if (typeof window === 'undefined') return;
  const next = getAnnotationMap();
  const cleanValue = value.trim();
  if (cleanValue) next[noteId] = value;
  else delete next[noteId];
  try {
    window.localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(ANNOTATIONS_EVENT));
  } catch {
    // Private browsing or a full storage quota should not break note reading.
  }
}

export function getAnnotationCount(): number {
  return Object.keys(getAnnotationMap()).length;
}
