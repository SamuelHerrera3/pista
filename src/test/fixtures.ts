import type { AppState } from "../lib/types";

/** A state in the exact shape the previous (vanilla) version saved to localStorage. */
export const LEGACY_STATE: AppState = {
  updatedAt: 1790000000000,
  sessions: [
    {
      id: "2026-09-22_push",
      date: "2026-09-22",
      type: "push",
      walked: true,
      cardioMin: "18",
      coreDone: [0, 2],
      stretchDone: true,
      notes: "Buen día",
      exercises: [
        { name: "Press con mancuernas en banco plano", sets: [{ kg: 20, reps: 10 }, { kg: 22.5, reps: 8 }] },
        { name: "Elevaciones laterales", sets: [{ kg: 6, reps: 12 }, { kg: null, reps: null }] }
      ]
    },
    {
      id: "2026-09-26_walk",
      date: "2026-09-26",
      type: "walk",
      walked: false,
      cardioMin: "95",
      coreDone: [],
      stretchDone: false,
      notes: "",
      exercises: []
    }
  ],
  body: [
    { date: "2026-09-20", weight: 79.4, waist: 88, steps: 6200 },
    { date: "2026-09-27", weight: 78.6, waist: null, steps: 9100 }
  ]
};
