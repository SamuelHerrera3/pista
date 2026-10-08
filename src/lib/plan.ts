import { diffDays, parse } from "./dates";

export type RoutineKind = "fuerza" | "cardio" | "descanso" | "festival";

export interface Routine {
  name: string;
  kind: RoutineKind;
  ex?: string[];
  cardio?: string;
  hint?: string;
}

export const FESTS = ["2026-10-31", "2026-11-15", "2026-11-30", "2026-12-15"];

export const ROUTINES: Record<string, Routine> = {
  push: {
    name: "Push",
    kind: "fuerza",
    ex: [
      "Press con mancuernas en banco plano",
      "Press inclinado en máquina",
      "Press de hombro en máquina",
      "Elevaciones laterales",
      "Extensión de tríceps en polea"
    ],
    cardio: "15–20 min de caminadora inclinada al final"
  },
  pull: {
    name: "Pull",
    kind: "fuerza",
    ex: ["Jalón al pecho", "Remo sentado en polea", "Remo con mancuerna a una mano", "Face pull", "Curl de bíceps"],
    cardio: "15–20 min de caminadora inclinada al final"
  },
  legs: {
    name: "Legs",
    kind: "fuerza",
    ex: [
      "Prensa de piernas",
      "Sentadilla goblet",
      "Hip thrust",
      "Curl femoral en máquina",
      "Extensión de cuádriceps",
      "Elevación de talones"
    ],
    cardio: "La vuelta caminando a casa ya cuenta"
  },
  z2: { name: "Cardio zona 2", kind: "cardio", hint: "35–45 min a ritmo en el que puedas hablar en frases cortas" },
  intervals: { name: "Intervalos", kind: "cardio", hint: "Escaladora o bici: 30 s fuerte / 90 s suave, 6–8 rondas" },
  walk: {
    name: "Caminata larga",
    kind: "cardio",
    hint: "90–120 min. Ej.: ir a Arkadia y volver por la Unidad Deportiva Belén Rincón"
  },
  recovery: { name: "Recuperación", kind: "cardio", hint: "Solo caminar suave y movilidad" },
  rest: { name: "Descanso", kind: "descanso", hint: "Descanso total. Igual suma pasos si puedes" },
  fest: {
    name: "Festival",
    kind: "festival",
    hint: "Come bien 2–3 h antes, agua con electrolitos, tenis con amortiguación"
  }
};

export const CORE = ["Dead bug · 8 por lado", "Bird dog · 8 por lado, 2 s arriba", "Plancha lateral · 20–30 s por lado"];

export const STRETCH = [
  "Gato-camello · 10 lentas",
  "Flexor de cadera en zancada · 30 s por lado",
  "Glúteo figura 4 · 30 s por lado",
  "Isquios con toalla · 30 s por lado",
  "Pecho en marco de puerta · 30 s"
];

export const routineOf = (type: string): Routine => ROUTINES[type] ?? { name: type, kind: "descanso", hint: "" };

export function nextFest(from: string): string | null {
  return FESTS.find((f) => f >= from) ?? null;
}

export function lastFestBefore(from: string): string | null {
  return [...FESTS].reverse().find((f) => f < from) ?? null;
}

export interface DayPlan {
  type: string;
  note: string;
}

const FIRST_WEEK: Record<number, string> = { 2: "push", 3: "z2", 4: "pull", 5: "legs", 6: "walk", 0: "rest", 1: "rest" };
const BASE_WEEK: Record<number, string> = { 1: "legs", 2: "z2", 3: "push", 4: "intervals", 5: "pull", 6: "walk", 0: "rest" };

/**
 * Ajustes puntuales decididos en el chat. Ganan sobre la semana base.
 * Retoma del 8 oct: tras 9 días sin entrenar, Pull en vez de intervalos y semana suave hasta el lunes.
 */
export const OVERRIDES: Record<string, DayPlan> = {
  "2026-10-08": {
    type: "pull",
    note: "Retomas después de 9 días: Pull con 2–3 reps de sobra. Core antes del cardio y 20 min de caminadora."
  },
  "2026-10-09": { type: "z2", note: "Semana de retoma: 35–40 min a ritmo cómodo. Puede ser caminando afuera." },
  "2026-10-10": { type: "walk", note: "Semana de retoma: 60–90 min bastan. El lunes vuelves al plan normal con Legs." }
};

export function planFor(s: string): DayPlan {
  if (OVERRIDES[s]) return { ...OVERRIDES[s] };
  if (FESTS.includes(s)) return { type: "fest", note: "Hoy se baila." };
  const prev = lastFestBefore(s);
  if (prev) {
    const since = diffDays(prev, s);
    if (since >= 1 && since <= 2) {
      return { type: "recovery", note: `Día ${since} después del festival: solo caminar y movilidad.` };
    }
  }
  const dow = parse(s).getDay();
  let type = s < "2026-10-05" ? FIRST_WEEK[dow] : BASE_WEEK[dow];
  const nf = nextFest(s);
  let note = "";
  if (nf) {
    const until = diffDays(s, nf);
    if (until <= 2) {
      type = until === 1 ? "rest" : ROUTINES[type].kind === "fuerza" ? "pull" : "recovery";
      note = until === 1 ? "Mañana es festival: descansa, come bien y duerme." : "Faltan 2 días: algo ligero, nada de piernas.";
    } else if (until <= 6) {
      if (type === "intervals") type = "recovery";
      note = "Semana de festival: mitad de series y lejos del fallo.";
    }
  }
  if (!note && prev && diffDays(prev, s) === 3 && type === "legs") {
    type = "push";
    note = "Vuelves después del festival: empieza por Push, Legs cuando no tengas las piernas cargadas.";
  }
  return { type, note };
}

export const defaultSets = (s: string) => (s < "2026-10-06" ? 2 : 3);
