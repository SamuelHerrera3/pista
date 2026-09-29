export interface SetEntry {
  kg: number | null;
  reps: number | null;
}

export interface Exercise {
  name: string;
  sets: SetEntry[];
}

export interface Session {
  id: string;
  date: string;
  type: string;
  walked: boolean;
  cardioMin: string | number;
  coreDone: number[];
  stretchDone: boolean;
  notes: string;
  exercises: Exercise[];
}

export interface BodyEntry {
  date: string;
  weight?: number | null;
  waist?: number | null;
  steps?: number | null;
}

/** Persisted shape. Do not change without a migration: it holds real data. */
export interface AppState {
  sessions: Session[];
  body: BodyEntry[];
  updatedAt: number;
}

export interface SyncConfig {
  url?: string;
  token?: string;
}
