// All note-related types. Single source of truth.

export type Difficulty = 'easy' | 'intermediate' | 'hard';

export interface NoteMeta {
  id: string;          // filepath slug: "Mathematics/SetTheory/01-Set"
  title: string;
  subject: string;
  semester: string;
  unit: string;
  tags: string[];
  difficulty: Difficulty;
  dateCreated: string;
  dateUpdated: string;
  wordCount: number;
  filePath: string;    // relative to content/
}

export interface Note extends NoteMeta {
  html: string;        // rendered markdown
  rawBody: string;     // for search indexing
}

export interface NoteTree {
  [semester: string]: {
    [subject: string]: {
      [unit: string]: NoteMeta[];
    };
  };
}

export interface SearchResult {
  id: string;
  title: string;
  subject: string;
  unit: string;
  difficulty: Difficulty;
  snippet: string;
  score: number;
}

export interface SiteMetadata {
  subjects: string[];
  semesters: string[];
  tags: string[];
  units: string[];
  stats: {
    totalNotes: number;
    lastUpdated: string;
  };
}
