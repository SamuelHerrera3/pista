import { useState } from "react";
import { StepsChart, WeightChart } from "../components/Charts";
import { addDays, short, todayISO } from "../lib/dates";
import { num } from "../lib/state";
import type { AppState, BodyEntry } from "../lib/types";
import { usePista } from "../store";

interface Form {
  date: string;
  weight: string;
  waist: string;
  steps: string;
}

const txt = (v: number | null | undefined) => (v == null ? "" : String(v));

function formFor(state: AppState, date: string): Form {
  const b = state.body.find((x) => x.date === date);
  return { date, weight: txt(b?.weight), waist: txt(b?.waist), steps: txt(b?.steps) };
}

const byDate = (a: BodyEntry, b: BodyEntry) => (a.date < b.date ? -1 : 1);
const fmt = (n: number | null | undefined) => (n == null ? "–" : n.toLocaleString("es-CO"));

export function Cuerpo() {
  const { state, today: t, update, toast } = usePista();
  const [form, setForm] = useState<Form>(() => formFor(state, t));

  const ws = state.body.filter((b) => b.weight != null).sort(byDate);
  const first = ws[0];
  const last = ws[ws.length - 1];
  const waists = state.body.filter((b) => b.waist != null).sort(byDate);
  const week = Array.from({ length: 7 }, (_, i) => addDays(t, -i))
    .map((d) => state.body.find((b) => b.date === d)?.steps)
    .filter((v): v is number => v != null);
  const avg = week.length ? Math.round(week.reduce((a, b) => a + b, 0) / week.length) : null;
  const delta = first && last && first !== last ? (last.weight as number) - (first.weight as number) : null;
  const wd = waists.length > 1 ? (waists[waists.length - 1].waist as number) - (waists[0].waist as number) : null;
  const signed = (n: number) => (n > 0 ? "+" : "") + n.toFixed(1);

  const save = () => {
    const date = form.date || todayISO();
    const rec: BodyEntry = { date, weight: num(form.weight), waist: num(form.waist), steps: num(form.steps) };
    if (rec.steps != null) rec.steps = Math.round(rec.steps);
    if (rec.weight == null && rec.waist == null && rec.steps == null) {
      toast("Escribe al menos un dato");
      return;
    }
    const nextBody = [...state.body.filter((b) => b.date !== date), rec];
    update((s) => ({ ...s, body: [...s.body.filter((b) => b.date !== date), rec] }));
    setForm(formFor({ ...state, body: nextBody }, t));
    toast("Registro guardado");
  };

  const remove = (date: string) => {
    if (!confirm(`¿Borrar el registro del ${short(date)}?`)) return;
    update((s) => ({ ...s, body: s.body.filter((b) => b.date !== date) }));
  };

  return (
    <>
      <section className="card">
        <h3>Registro del día</h3>
        <div className="fields">
          <label>
            Fecha
            <input type="date" value={form.date} onChange={(e) => setForm(e.target.value ? formFor(state, e.target.value) : { ...form, date: "" })} />
          </label>
          <label>
            Peso (kg)
            <input
              inputMode="decimal"
              value={form.weight}
              placeholder={last ? String(last.weight) : "ej. 78"}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </label>
          <label>
            Cintura (cm)
            <input inputMode="decimal" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
          </label>
          <label>
            Pasos
            <input inputMode="numeric" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
          </label>
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>
          Pésate en ayunas, 1–2 veces por semana. Cintura a la altura del ombligo, cada semana.
        </p>
        <button className="primary" onClick={save}>
          Guardar registro
        </button>
      </section>

      <div className="stats">
        <div className="stat">
          <div className="v">{last ? last.weight : "–"}</div>
          <div className="k">kg actual</div>
        </div>
        <div className="stat">
          <div className={`v ${delta != null && delta < 0 ? "up" : ""}`}>{delta == null ? "–" : signed(delta)}</div>
          <div className="k">kg desde el inicio</div>
        </div>
        <div className="stat">
          <div className={`v ${wd != null && wd < 0 ? "up" : ""}`}>{wd == null ? "–" : signed(wd)}</div>
          <div className="k">cm de cintura</div>
        </div>
        <div className="stat">
          <div className="v">{fmt(avg)}</div>
          <div className="k">pasos/día, últimos 7</div>
        </div>
      </div>

      <h2>Peso</h2>
      <WeightChart body={state.body} />
      <h2>Pasos</h2>
      <StepsChart body={state.body} today={t} />

      <h2>Registros</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th className="num">kg</th>
              <th className="num">cintura</th>
              <th className="num">pasos</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {[...state.body].sort((a, b) => -byDate(a, b)).map((b) => (
              <tr key={b.date}>
                <td>{short(b.date)}</td>
                <td className="num">{b.weight ?? "–"}</td>
                <td className="num">{b.waist ?? "–"}</td>
                <td className="num">{fmt(b.steps)}</td>
                <td>
                  <button className="x" aria-label="Borrar registro" onClick={() => remove(b.date)}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {!state.body.length && (
              <tr>
                <td colSpan={5} className="muted">
                  Aún no hay registros. Empieza con tu peso de hoy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
