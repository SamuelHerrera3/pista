import { addDays, pretty } from "../lib/dates";
import { ROUTINES, routineOf } from "../lib/plan";
import { clone, num } from "../lib/state";
import type { SetEntry } from "../lib/types";
import { usePista } from "../store";

interface Progress {
  first: SetEntry;
  last: SetEntry;
}

export function Historial({ onOpen }: { onOpen: () => void }) {
  const { state, today: t, update, setDraft } = usePista();
  const sess = [...state.sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const since = addDays(t, -6);
  const thisWeek = sess.filter((s) => s.date >= since);
  const strength = thisWeek.filter((s) => ROUTINES[s.type] && ROUTINES[s.type].kind === "fuerza").length;
  const cardioMin = thisWeek.reduce((a, s) => a + (s.type !== "fest" ? num(String(s.cardioMin)) || 0 : 0), 0);

  const prog: Record<string, Progress> = {};
  [...sess].reverse().forEach((s) =>
    (s.exercises || []).forEach((e) => {
      const valid = e.sets.filter((x) => x.kg != null && x.reps != null);
      if (!valid.length) return;
      const best = valid.reduce(
        (m, x) => ((x.kg as number) > (m.kg as number) || (x.kg === m.kg && (x.reps as number) > (m.reps as number)) ? x : m),
        valid[0]
      );
      if (!prog[e.name]) prog[e.name] = { first: best, last: best };
      prog[e.name].last = best;
    })
  );
  const rows = Object.entries(prog);

  return (
    <>
      <div className="stats">
        <div className="stat">
          <div className="v">{thisWeek.length}</div>
          <div className="k">sesiones, últimos 7 días</div>
        </div>
        <div className="stat">
          <div className="v">{strength}</div>
          <div className="k">de fuerza</div>
        </div>
        <div className="stat">
          <div className="v">{cardioMin}</div>
          <div className="k">min de cardio</div>
        </div>
      </div>

      <h2>Progreso por ejercicio</h2>
      {rows.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ejercicio</th>
                <th className="num">Inicio</th>
                <th className="num">Ahora</th>
                <th className="num">Subió</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([name, p]) => {
                const up = (p.last.kg as number) - (p.first.kg as number);
                return (
                  <tr key={name}>
                    <td className="wrap-cell">{name}</td>
                    <td className="num">
                      {p.first.kg}×{p.first.reps}
                    </td>
                    <td className="num">
                      {p.last.kg}×{p.last.reps}
                    </td>
                    <td className={`num ${up > 0 ? "up" : ""}`}>{up > 0 ? `+${up} kg` : "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted">Cuando guardes tu primera sesión de fuerza, aquí verás cómo sube cada ejercicio.</p>
      )}

      <h2>Sesiones</h2>
      {sess.length ? (
        sess.map((s) => {
          const r = routineOf(s.type);
          const vol = (s.exercises || []).reduce((a, e) => a + e.sets.filter((x) => x.kg != null && x.reps != null).length, 0);
          const bits = [
            vol ? `${vol} series` : "",
            s.cardioMin ? `${s.cardioMin}${s.type === "fest" ? " h" : " min"}` : "",
            s.walked ? "fue caminando" : "",
            s.coreDone && s.coreDone.length ? `core ${s.coreDone.length}/3` : ""
          ].filter(Boolean);
          return (
            <section className="card" key={s.id}>
              <div className="split">
                <div className="grow">
                  <span className={`pill ${s.type === "fest" ? "pink" : ""}`}>{r.name}</span>{" "}
                  <span className="small muted">{pretty(s.date)}</span>
                  {bits.length > 0 && <div className="small muted">{bits.join(" · ")}</div>}
                  {s.notes && <div className="small">{s.notes}</div>}
                </div>
                <div className="actions">
                  <button
                    className="link"
                    onClick={() => {
                      setDraft(clone(s));
                      onOpen();
                    }}
                  >
                    Abrir
                  </button>
                  <button
                    className="x"
                    aria-label="Borrar sesión"
                    onClick={() => {
                      if (!confirm("¿Borrar esta sesión?")) return;
                      update((st) => ({ ...st, sessions: st.sessions.filter((x) => x.id !== s.id) }));
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </section>
          );
        })
      ) : (
        <p className="muted">Todavía no hay sesiones. Guarda la de hoy desde la pestaña Hoy.</p>
      )}
    </>
  );
}
