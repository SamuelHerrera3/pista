import { useState, type ChangeEvent } from "react";
import { todayISO } from "../lib/dates";
import { SCRIPT_URL_RE } from "../lib/sheets";
import { mergeBackup, parseBackup } from "../lib/state";
import { usePista } from "../store";

export function DataSection() {
  const { state, cfg, syncMsg, update, toast, connect, disconnect } = usePista();
  const [url, setUrl] = useState(cfg.url ?? "");
  const [token, setToken] = useState(cfg.token ?? "");

  const onConnect = () => {
    const u = url.trim();
    const t = token.trim();
    if (!SCRIPT_URL_RE.test(u)) return toast("La URL debe terminar en /exec");
    if (!t) return toast("Falta la clave");
    connect(u, t);
  };

  const onDisconnect = () => {
    if (!confirm("¿Desconectar Google Sheets? Tus datos siguen en el celular y en la hoja.")) return;
    disconnect();
    setUrl("");
    setToken("");
  };

  const onExport = () => {
    const json = JSON.stringify({ app: "pista", version: 1, exportedAt: new Date().toISOString(), state }, null, 1);
    const file = new File([json], `pista-respaldo-${todayISO()}.json`, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: "Respaldo Pista" }).catch(() => {});
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1000);
  };

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      const incoming = parseBackup(JSON.parse(await file.text()));
      const hasData = state.sessions.length > 0 || state.body.length > 0;
      const merge =
        hasData && confirm("Ya tienes datos aquí. Aceptar = combinar con el respaldo. Cancelar = reemplazar todo por el respaldo.");
      const next = merge ? mergeBackup(state, incoming) : { ...incoming };
      update(() => next);
      toast(`Respaldo importado: ${next.sessions.length} sesiones, ${next.body.length} registros`);
    } catch {
      toast("Ese archivo no es un respaldo válido de Pista");
    }
    input.value = "";
  };

  return (
    <>
      <h2>Respaldo y sincronización</h2>
      <section className="card">
        <h3>Google Sheets</h3>
        <p className="small muted">
          Pega la URL de tu Apps Script y la clave que pusiste en TOKEN. Tus datos se suben a tu hoja cada vez que guardas.
        </p>
        <label>
          URL del script
          <input
            inputMode="url"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/…/exec"
          />
        </label>
        <label style={{ marginTop: 8 }}>
          Clave (TOKEN)
          <input type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
        <button className="primary" onClick={onConnect}>
          {cfg.url ? "Guardar y sincronizar" : "Conectar"}
        </button>
        {cfg.url && (
          <p style={{ marginTop: 10 }}>
            <button className="ghost" onClick={onDisconnect}>
              Desconectar Sheets
            </button>
          </p>
        )}
        <div className="sync">{syncMsg}</div>
      </section>

      <section className="card">
        <h3>Respaldo manual</h3>
        <p className="small muted">Exporta un archivo con todo, o importa el respaldo que descargaste del tracker de Claude.</p>
        <button className="primary" onClick={onExport}>
          Exportar respaldo
        </button>
        <label style={{ marginTop: 12 }}>
          Importar respaldo (.json)
          <input type="file" accept="application/json,.json" onChange={onImport} />
        </label>
      </section>
    </>
  );
}
