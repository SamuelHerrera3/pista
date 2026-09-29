import { addDays, parse, short } from "../lib/dates";
import type { BodyEntry } from "../lib/types";

export function WeightChart({ body }: { body: BodyEntry[] }) {
  const pts = body.filter((b) => b.weight != null).sort((a, b) => (a.date < b.date ? -1 : 1));
  if (pts.length < 2) return <p className="small muted">Con dos registros de peso aparece la gráfica.</p>;

  const W = 640,
    H = 220,
    P = 44;
  const ws = pts.map((p) => p.weight as number);
  const min = Math.floor(Math.min(...ws) - 1);
  const max = Math.ceil(Math.max(...ws) + 1);
  const t0 = parse(pts[0].date).getTime();
  const t1 = Math.max(parse(pts[pts.length - 1].date).getTime(), t0 + 86400000);
  const x = (d: string) => P + ((parse(d).getTime() - t0) / (t1 - t0)) * (W - P - 10);
  const y = (w: number) => 10 + ((max - w) / (max - min)) * (H - P - 10);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)} ${y(p.weight as number).toFixed(1)}`).join(" ");
  const first = pts[0];
  const last = pts[pts.length - 1];

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Peso en el tiempo">
      {[min, (min + max) / 2, max].map((v) => (
        <g key={v}>
          <line x1={P} x2={W - 10} y1={y(v)} y2={y(v)} style={{ stroke: "var(--line)" }} />
          <text x={P - 8} y={y(v) + 6} textAnchor="end">
            {v.toFixed(0)}
          </text>
        </g>
      ))}
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--primary)", stopOpacity: 0.28 }} />
          <stop offset="1" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={`${path} L${x(last.date).toFixed(1)} ${H - P} L${x(first.date).toFixed(1)} ${H - P} Z`} fill="url(#wg)" />
      <path
        d={path}
        fill="none"
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ stroke: "var(--primary)" }}
      />
      {pts.map((p) => (
        <circle
          key={p.date}
          cx={x(p.date)}
          cy={y(p.weight as number)}
          r={4.5}
          strokeWidth={2.5}
          style={{ fill: "var(--surface)", stroke: "var(--primary)" }}
        />
      ))}
      <text x={P} y={H - 8}>
        {short(first.date)}
      </text>
      <text x={W - 10} y={H - 8} textAnchor="end">
        {short(last.date)}
      </text>
    </svg>
  );
}

export function StepsChart({ body, today }: { body: BodyEntry[]; today: string }) {
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const map: Record<string, number> = {};
  body.forEach((b) => {
    if (b.steps != null) map[b.date] = b.steps;
  });
  if (!days.some((d) => map[d] != null)) {
    return <p className="small muted">Registra tus pasos para ver las últimas dos semanas.</p>;
  }

  const W = 640,
    H = 180,
    P = 10;
  const top = Math.max(12000, ...days.map((d) => map[d] || 0));
  const bw = (W - 2 * P) / 14;
  const y = (v: number) => H - 24 - (v / top) * (H - 40);

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Pasos de los últimos 14 días">
      <line x1={P} x2={W - P} y1={y(10000)} y2={y(10000)} strokeDasharray="5 5" style={{ stroke: "var(--accent)" }} />
      <text x={W - P} y={y(10000) - 5} textAnchor="end">
        meta 10.000
      </text>
      {days.map((d, i) => {
        const v = map[d];
        if (v == null) return null;
        return (
          <rect
            key={d}
            x={P + i * bw + 4}
            y={y(v)}
            width={bw - 8}
            height={H - 24 - y(v)}
            rx={6}
            opacity={v >= 10000 ? 1 : 0.75}
            style={{ fill: v >= 10000 ? "var(--accent)" : "var(--primary)" }}
          />
        );
      })}
      {days.map((d, i) =>
        i % 2 === 1 ? (
          <text key={d} x={P + i * bw + bw / 2} y={H - 6} textAnchor="middle">
            {parse(d).getDate()}
          </text>
        ) : null
      )}
    </svg>
  );
}
