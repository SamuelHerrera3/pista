import { diffDays, pretty, short } from "../lib/dates";
import { FESTS, nextFest } from "../lib/plan";
import { usePista } from "../store";

export function Hero() {
  const { today: t } = usePista();
  const nf = nextFest(t);
  let big: string | number;
  let lbl: string;
  let when = "";
  if (!nf) {
    big = "✓";
    lbl = "Temporada de festivales completa";
  } else {
    const d = diffDays(t, nf);
    big = d === 0 ? "Hoy" : d;
    lbl = d === 0 ? "Festival hoy, a bailar" : d === 1 ? "día para el próximo festival" : "días para el próximo festival";
    when = d === 0 ? "" : pretty(nf);
  }
  const done = FESTS.filter((f) => f < t).length;
  const idx = nf ? FESTS.indexOf(nf) : FESTS.length - 1;
  let frac = 0;
  if (nf && idx > 0) {
    const prev = FESTS[idx - 1];
    frac = Math.min(1, Math.max(0, diffDays(prev, t) / diffDays(prev, nf)));
  }
  const fillPct = !nf ? 75 : idx === 0 ? 0 : (idx - 1 + frac) * 25;

  return (
    <header className="hero">
      <div className="big num">{big}</div>
      <div className="lbl">{lbl}</div>
      {when && <div className="when">{when}</div>}
      <div className="track" aria-label={`Festivales: ${done} de ${FESTS.length} hechos`}>
        <span className="fill" style={{ width: `${fillPct}%` }} />
        {FESTS.map((f, i) => (
          <div key={f} className={`stop ${f < t ? "done" : ""} ${f === nf ? "next" : ""}`}>
            <div className="dot" />
            <b>F{i + 1}</b>
            {short(f)}
          </div>
        ))}
      </div>
    </header>
  );
}
