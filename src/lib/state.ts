import { defaultSets, routineOf } from "./plan";
import type { AppState, Session } from "./types";

export const LS_KEY = "pista-tracker-v1";
export const CFG_KEY = "pista-sync-v1";

export const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

export const emptyState = (): AppState => ({ sessions: [], body: [], updatedAt: 0 });

/** Accepts anything stored or received and returns the persisted shape. */
export function normalize(s: unknown): AppState {
  const o = (s ?? {}) as Partial<AppState>;
  return {
    sessions: Array.isArray(o.sessions) ? o.sessions : [],
    body: Array.isArray(o.body) ? o.body : [],
    updatedAt: o.updatedAt || 0
  };
}

/** Parses a JSON backup file. Accepts `{state}` (Pista export) or the bare state. */
export function parseBackup(data: unknown): AppState {
  const d = data as { state?: unknown } | null;
  const incoming = normalize(d && d.state ? d.state : data);
  if (!incoming.sessions.length && !incoming.body.length) throw new Error("vacío");
  return incoming;
}

/** Combines a backup into current data. Existing entries win on the same id or date. */
export function mergeBackup(current: AppState, incoming: AppState): AppState {
  const ses = new Map(current.sessions.map((s) => [s.id, s]));
  incoming.sessions.forEach((s) => {
    if (!ses.has(s.id)) ses.set(s.id, s);
  });
  const bod = new Map(current.body.map((b) => [b.date, b]));
  incoming.body.forEach((b) => {
    if (!bod.has(b.date)) bod.set(b.date, b);
  });
  return { ...current, sessions: [...ses.values()], body: [...bod.values()] };
}

export function num(v: string): number | null {
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function lastSessionWith(state: AppState, exName: string, beforeDate: string) {
  const list = state.sessions.filter(
    (s) =>
      s.date < beforeDate &&
      s.exercises &&
      s.exercises.some((e) => e.name === exName && e.sets.some((x) => x.kg != null || x.reps != null))
  );
  list.sort((a, b) => (a.date < b.date ? 1 : -1));
  if (!list.length) return null;
  const e = list[0].exercises.find((x) => x.name === exName)!;
  return { date: list[0].date, sets: e.sets.filter((x) => x.kg != null || x.reps != null) };
}

export function newDraft(state: AppState, date: string, type: string): Session {
  const found = state.sessions.find((s) => s.date === date && s.type === type);
  if (found) return clone(found);
  const r = routineOf(type);
  const n = defaultSets(date);
  return {
    id: `${date}_${type}`,
    date,
    type,
    walked: false,
    cardioMin: "",
    coreDone: [],
    stretchDone: false,
    notes: "",
    exercises:
      r.kind === "fuerza" && r.ex
        ? r.ex.map((name) => ({ name, sets: Array.from({ length: n }, () => ({ kg: null, reps: null })) }))
        : []
  };
}

export function loadLocal(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    /* storage unavailable or corrupt: start empty */
  }
  return null;
}

export function saveLocal(state: AppState): boolean {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
