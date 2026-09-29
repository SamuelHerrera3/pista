import { short } from "../lib/dates";
import { FESTS } from "../lib/plan";
import { DataSection } from "./DataSection";

const WEEK: [string, string][] = [
  ["Lunes", "Legs + core"],
  ["Martes", "Cardio zona 2, 35–45 min"],
  ["Miércoles", "Push + core + 15–20 min caminadora inclinada"],
  ["Jueves", "Intervalos"],
  ["Viernes", "Pull + core + 15–20 min caminadora inclinada"],
  ["Sábado", "Caminata larga, 90–120 min"],
  ["Domingo", "Descanso"]
];

export function Plan() {
  return (
    <>
      <h2>Semana base (desde el 5 de octubre)</h2>
      <div className="table-wrap">
        <table>
          <tbody>
            {WEEK.map(([day, what]) => (
              <tr key={day}>
                <td>{day}</td>
                <td className="wrap-cell">{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ marginTop: 8 }}>
        Esta primera semana: mar Push, mié zona 2, jue Pull, vie Legs suave, sáb caminata de 60 min, dom descanso.
      </p>

      <h2>Ir caminando a Arkadia</h2>
      <ul className="plain">
        <li>Ida y vuelta son ~3,8 km y ~5.000–5.500 pasos: la mitad de la meta diaria.</li>
        <li>Llegas caliente: en el gimnasio basta con 3–5 min de movilidad.</li>
        <li>
          En Push y Pull mantén los 15–20 min de caminadora inclinada: sube más el pulso que la calle y es lo que construye
          resistencia.
        </li>
        <li>En Legs, la vuelta con las piernas cansadas es práctica para el festival.</li>
        <li>Si un día no te da el tiempo, ve a Los Molinos (~32 min ida y vuelta). Ir siempre pesa más que ir lejos.</li>
      </ul>

      <h2>Progresión</h2>
      <ul className="plain">
        <li>Semana 1: 2 series de 10–12, dejando 3–4 repeticiones de sobra.</li>
        <li>Desde la semana 2: 3 series. Con 12 limpias en todas, sube el peso.</li>
        <li>Pasos: suma ~2.000 por semana hasta 10.000–12.000 diarios.</li>
      </ul>

      <h2>Alrededor de cada festival</h2>
      <ul className="plain">
        <li>5–6 días antes: mitad de series, nada al fallo; los intervalos pasan a caminata suave.</li>
        <li>2 días antes: algo ligero y nada de piernas. Día antes: descanso.</li>
        <li>1–2 días después: solo caminar y movilidad. Retoma por Push.</li>
      </ul>

      <h2>Comida</h2>
      <ul className="plain">
        <li>~2.000–2.100 kcal y 130–150 g de proteína al día: proteína en cada comida.</li>
        <li>Plato: mitad verduras, un cuarto proteína, un cuarto carbohidrato. Más carbohidrato los días de entreno.</li>
        <li>Domingo: cocina proteína, arroz y granos para 3–4 días.</li>
      </ul>

      <p className="small muted" style={{ marginTop: 14 }}>
        Fechas de festival: {FESTS.map(short).join(", ")}.
      </p>

      <DataSection />
    </>
  );
}
