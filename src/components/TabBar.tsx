export type Tab = "hoy" | "cuerpo" | "historial" | "plan";

const TABS: { id: Tab; label: string }[] = [
  { id: "hoy", label: "Hoy" },
  { id: "cuerpo", label: "Peso y pasos" },
  { id: "historial", label: "Historial" },
  { id: "plan", label: "Plan" }
];

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="tabs" role="tablist" aria-label="Secciones">
      {TABS.map((t) => (
        <button key={t.id} role="tab" data-tab={t.id} aria-selected={t.id === tab} onClick={() => onTab(t.id)}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
