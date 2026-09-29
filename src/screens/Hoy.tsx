import { NumInput } from "../components/NumInput";
import { pretty, short } from "../lib/dates";
import { CORE, ROUTINES, STRETCH, planFor, routineOf } from "../lib/plan";
import { clone, lastSessionWith, newDraft } from "../lib/state";
import { usePista } from "../store";

export function Hoy() {
  const { state, draft, setDraft, editDraft, update, toast, syncMsg } = usePista();
  const p = planFor(draft.date);
  const r = routineOf(draft.type);
  const planRoutine = routineOf(p.type);

  const save = () => {
    const clean = clone(draft);
    update((s) => ({ ...s, sessions: [...s.sessions.filter((x) => x.id !== clean.id), clean] }));
    toast("Sesión guardada");
  };

  return (
    <>
      <section className={`card today-plan ${p.type === "fest" ? "fest" : ""}`}>
        <p className="small muted">{pretty(draft.date)}</p>
        <h3>El plan dice: {planRoutine.name}</h3>
        {p.note && <p className="small">{p.note}</p>}
        <div className="fields">
          <label className="wide">
            Fecha
            <input
              type="date"
              value={draft.date}
              onChange={(e) => e.target.value && setDraft(newDraft(state, e.target.value, planFor(e.target.value).type))}
            />
          </label>
          <label className="wide">
            Sesión
            <select value={draft.type} onChange={(e) => setDraft(newDraft(state, draft.date, e.target.value))}>
              {Object.entries(ROUTINES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                  {k === p.type ? " (según el plan)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {r.kind === "fuerza" && (
        <>
          <label className="check card">
            <input type="checkbox" checked={draft.walked} onChange={(e) => editDraft((d) => void (d.walked = e.target.checked))} />
            Fui y volví caminando al gimnasio
          </label>
          <p className="small muted">
            {draft.walked ? "Llegas caliente: con 3–5 min de movilidad basta. " : ""}
            Deja 2–4 repeticiones de sobra. Cuando hagas 12 limpias en todas las series, sube el peso.
          </p>
          {draft.exercises.map((e, ei) => {
            const last = lastSessionWith(state, e.name, draft.date);
            const lastTxt = last
              ? `Última vez (${short(last.date)}): ` + last.sets.map((x) => `${x.kg ?? "–"}kg×${x.reps ?? "–"}`).join(", ")
              : "Primera vez: busca un peso cómodo de referencia";
            return (
              <section className="card ex" key={`${draft.id}-${ei}`}>
                <h3>
                  <span>{e.name}</span>
                </h3>
                <div className="last">{lastTxt}</div>
                <div className="set small muted" aria-hidden="true">
                  <span />
                  <span className="c">kg</span>
                  <span className="c">reps</span>
                  <span />
                </div>
                {e.sets.map((x, si) => {
                  const ph = last && last.sets[si] ? last.sets[si] : null;
                  return (
                    <div className="set" key={si}>
                      <span className="n">{si + 1}</span>
                      <NumInput
                        inputMode="decimal"
                        aria-label={`kg serie ${si + 1}`}
                        value={x.kg}
                        placeholder={ph && ph.kg != null ? String(ph.kg) : ""}
                        onValue={(v) => editDraft((d) => void (d.exercises[ei].sets[si].kg = v))}
                      />
                      <NumInput
                        inputMode="numeric"
                        aria-label={`reps serie ${si + 1}`}
                        value={x.reps}
                        placeholder={ph && ph.reps != null ? String(ph.reps) : ""}
                        onValue={(v) => editDraft((d) => void (d.exercises[ei].sets[si].reps = v))}
                      />
                      <button
                        className="x"
                        aria-label="Quitar serie"
                        onClick={() => {
                          if (e.sets.length > 1) editDraft((d) => void d.exercises[ei].sets.splice(si, 1));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                <button className="ghost" onClick={() => editDraft((d) => void d.exercises[ei].sets.push({ kg: null, reps: null }))}>
                  + serie
                </button>
              </section>
            );
          })}

          <section className="card">
            <h3>Core</h3>
            {CORE.map((c, i) => (
              <label className="check" key={c}>
                <input
                  type="checkbox"
                  checked={draft.coreDone.includes(i)}
                  onChange={(e) =>
                    editDraft((d) => {
                      d.coreDone = e.target.checked ? [...new Set([...d.coreDone, i])] : d.coreDone.filter((x) => x !== i);
                    })
                  }
                />
                {c}
              </label>
            ))}
          </section>

          <section className="card">
            <h3>Cardio al final</h3>
            <p className="small muted">{r.cardio}</p>
            <label>
              Minutos
              <input
                inputMode="numeric"
                value={String(draft.cardioMin ?? "")}
                onChange={(e) => editDraft((d) => void (d.cardioMin = e.target.value))}
              />
            </label>
          </section>
        </>
      )}

      {(r.kind === "cardio" || r.kind === "festival") && (
        <section className="card">
          <p>{r.hint}</p>
          <label>
            {r.kind === "festival" ? "Horas bailadas" : "Minutos"}
            <input
              inputMode="decimal"
              value={String(draft.cardioMin ?? "")}
              onChange={(e) => editDraft((d) => void (d.cardioMin = e.target.value))}
            />
          </label>
        </section>
      )}

      {r.kind === "descanso" && (
        <section className="card">
          <p>{r.hint}</p>
        </section>
      )}

      <section className="card">
        <h3>Estiramiento (8–10 min)</h3>
        <label className="check">
          <input type="checkbox" checked={draft.stretchDone} onChange={(e) => editDraft((d) => void (d.stretchDone = e.target.checked))} />
          Lo hice
        </label>
        <ul className="plain small muted">
          {STRETCH.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <label>
          Notas (cómo te sentiste, espalda, aire…)
          <textarea value={draft.notes} onChange={(e) => editDraft((d) => void (d.notes = e.target.value))} />
        </label>
        <button className="primary" onClick={save}>
          Guardar sesión
        </button>
        <div className="sync">{syncMsg}</div>
      </section>
    </>
  );
}
