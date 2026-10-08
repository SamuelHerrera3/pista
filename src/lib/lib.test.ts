import { describe, expect, it } from "vitest";
import { LEGACY_STATE } from "../test/fixtures";
import legacyPlan from "../test/legacy-plan.json";
import { addDays } from "./dates";
import { OVERRIDES, defaultSets, planFor } from "./plan";
import { lastSessionWith, mergeBackup, newDraft, normalize, num, parseBackup } from "./state";

describe("planFor", () => {
  it("matches the previous version on every day from 20 Sep 2026 to 10 Jan 2027", () => {
    const days = Object.keys(legacyPlan);
    expect(days.length).toBeGreaterThan(100);
    for (const d of days) {
      if (OVERRIDES[d]) continue;
      const expected = (legacyPlan as Record<string, { type: string; note: string; sets: number }>)[d];
      expect({ d, ...planFor(d), sets: defaultSets(d) }).toEqual({ d, ...expected });
    }
  });

  it("applies the chat overrides for the restart week", () => {
    expect(planFor("2026-10-08").type).toBe("pull");
    expect(planFor("2026-10-09").type).toBe("z2");
    expect(planFor("2026-10-10").type).toBe("walk");
    expect(planFor("2026-10-12").type).toBe("legs");
  });

  it("puts a festival on its own day and rest the day before", () => {
    expect(planFor("2026-10-31").type).toBe("fest");
    expect(planFor("2026-10-30").type).toBe("rest");
  });
});

describe("dates", () => {
  it("adds days across a month boundary", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
  });
});

describe("state shape", () => {
  it("normalize keeps a legacy state untouched", () => {
    expect(normalize(LEGACY_STATE)).toEqual(LEGACY_STATE);
  });

  it("normalize repairs garbage without throwing", () => {
    expect(normalize(null)).toEqual({ sessions: [], body: [], updatedAt: 0 });
    expect(normalize({ sessions: "x", body: 3 })).toEqual({ sessions: [], body: [], updatedAt: 0 });
  });

  it("parseBackup accepts the wrapped export and the bare state", () => {
    expect(parseBackup({ app: "pista", version: 1, state: LEGACY_STATE })).toEqual(LEGACY_STATE);
    expect(parseBackup(LEGACY_STATE)).toEqual(LEGACY_STATE);
  });

  it("parseBackup rejects an empty backup", () => {
    expect(() => parseBackup({ state: { sessions: [], body: [] } })).toThrow();
    expect(() => parseBackup({ hello: "world" })).toThrow();
  });

  it("mergeBackup keeps existing entries and adds new ones", () => {
    const current = normalize({
      sessions: [{ ...LEGACY_STATE.sessions[0], notes: "mine" }],
      body: [{ date: "2026-09-20", weight: 80 }],
      updatedAt: 5
    });
    const merged = mergeBackup(current, LEGACY_STATE);
    expect(merged.sessions).toHaveLength(2);
    expect(merged.sessions.find((s) => s.id === "2026-09-22_push")?.notes).toBe("mine");
    expect(merged.body).toHaveLength(2);
    expect(merged.body.find((b) => b.date === "2026-09-20")?.weight).toBe(80);
    expect(merged.updatedAt).toBe(5);
  });
});

describe("num", () => {
  it("accepts comma decimals and rejects text", () => {
    expect(num("7,5")).toBe(7.5);
    expect(num("78")).toBe(78);
    expect(num("abc")).toBeNull();
  });
});

describe("drafts", () => {
  it("creates the planned sets for a strength day", () => {
    const d = newDraft(normalize(null), "2026-10-07", "push");
    expect(d.id).toBe("2026-10-07_push");
    expect(d.exercises).toHaveLength(5);
    expect(d.exercises[0].sets).toHaveLength(3);
    expect(d.exercises[0].sets[0]).toEqual({ kg: null, reps: null });
  });

  it("reopens a saved session for the same date and type", () => {
    const d = newDraft(LEGACY_STATE, "2026-09-22", "push");
    expect(d.notes).toBe("Buen día");
    expect(d.exercises[0].sets[1]).toEqual({ kg: 22.5, reps: 8 });
  });

  it("finds the last time an exercise was done", () => {
    const last = lastSessionWith(LEGACY_STATE, "Press con mancuernas en banco plano", "2026-10-01");
    expect(last?.date).toBe("2026-09-22");
    expect(last?.sets).toHaveLength(2);
    expect(lastSessionWith(LEGACY_STATE, "Press con mancuernas en banco plano", "2026-09-22")).toBeNull();
  });
});
