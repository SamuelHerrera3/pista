export const DOW = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const pad = (n: number) => String(n).padStart(2, "0");

export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: string, n: number) => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const diffDays = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000);

export const todayISO = () => iso(new Date());

export const pretty = (s: string) => {
  const d = parse(s);
  return `${DOW[d.getDay()]} ${d.getDate()} ${MES[d.getMonth()]}`;
};

export const short = (s: string) => {
  const d = parse(s);
  return `${d.getDate()} ${MES[d.getMonth()]}`;
};
