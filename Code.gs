/**
 * Backend de Pista en Google Sheets.
 * 1. Proyecto → Configuración → Propiedades del script → agrega TOKEN con una clave larga.
 * 2. Implementar → Nueva implementación → Aplicación web
 *    Ejecutar como: Yo · Quién tiene acceso: Cualquier persona
 * 3. Copia la URL que termina en /exec y pégala en la app (Plan → Respaldo y sincronización).
 *
 * La pestaña "_datos" guarda el respaldo completo (no la edites a mano).
 * "Sesiones", "Series" y "Cuerpo" se reescriben en cada guardado para que puedas analizarlas.
 */
const RAW = "_datos";
const CHUNK = 40000; // una celda admite ~50.000 caracteres

function doPost(e) {
  let out;
  try { out = handle(JSON.parse((e && e.postData && e.postData.contents) || "{}")); }
  catch (err) { out = { ok: false, error: String(err && err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, app: "pista" })).setMimeType(ContentService.MimeType.JSON);
}

function handle(req) {
  const token = PropertiesService.getScriptProperties().getProperty("TOKEN");
  if (!token || req.token !== token) return { ok: false, error: "token" };
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (req.action === "load") {
    const sh = ss.getSheetByName(RAW);
    if (!sh || sh.getLastRow() === 0) return { ok: true, state: null };
    const txt = sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => String(r[0]).slice(1)).join("");
    return { ok: true, state: txt ? JSON.parse(txt) : null };
  }

  if (req.action === "save") {
    if (!req.state || !Array.isArray(req.state.sessions) || !Array.isArray(req.state.body)) return { ok: false, error: "datos inválidos" };
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      writeRaw(ss, JSON.stringify(req.state));
      writeTables(ss, req.state);
    } finally { lock.releaseLock(); }
    return { ok: true, savedAt: new Date().toISOString() };
  }
  return { ok: false, error: "acción desconocida" };
}

function safe(v) { v = String(v || ""); return /^[=+\-@]/.test(v) ? "'" + v : v; }

function sheet(ss, name) { return ss.getSheetByName(name) || ss.insertSheet(name); }

function writeRaw(ss, txt) {
  const sh = sheet(ss, RAW);
  sh.clear();
  const rows = [];
  for (let i = 0; i < txt.length; i += CHUNK) rows.push(["~" + txt.slice(i, i + CHUNK)]); // "~" evita que Sheets lo lea como fórmula
  if (rows.length) sh.getRange(1, 1, rows.length, 1).setNumberFormat("@").setValues(rows);
}

function writeTable(ss, name, header, rows) {
  const sh = sheet(ss, name);
  sh.clearContents();
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold");
  if (rows.length) sh.getRange(2, 1, rows.length, header.length).setValues(rows);
  sh.setFrozenRows(1);
}

function writeTables(ss, st) {
  const sessions = st.sessions.slice().sort((a, b) => a.date < b.date ? -1 : 1);
  writeTable(ss, "Sesiones",
    ["Fecha", "Tipo", "Fue caminando", "Cardio (min / h festival)", "Core hecho", "Estiramiento", "Notas"],
    sessions.map(s => [s.date, s.type, !!s.walked, s.cardioMin || "", (s.coreDone || []).length + "/3", !!s.stretchDone, safe(s.notes)]));
  const series = [];
  sessions.forEach(s => (s.exercises || []).forEach(e => e.sets.forEach((x, i) => {
    if (x.kg != null || x.reps != null) series.push([s.date, s.type, e.name, i + 1, x.kg == null ? "" : x.kg, x.reps == null ? "" : x.reps]);
  })));
  writeTable(ss, "Series", ["Fecha", "Tipo", "Ejercicio", "Serie", "Kg", "Reps"], series);
  writeTable(ss, "Cuerpo", ["Fecha", "Peso (kg)", "Cintura (cm)", "Pasos"],
    st.body.slice().sort((a, b) => a.date < b.date ? -1 : 1).map(b => [b.date, b.weight == null ? "" : b.weight, b.waist == null ? "" : b.waist, b.steps == null ? "" : b.steps]));
}

/* ---------- Puente con el chat de claude.ai ----------
 * Copia CONTEXTO.md del repo a la pestaña "Contexto" de esta hoja cada hora,
 * para que Claude en el chat lo lea desde Google Drive sin que tengas que pegar nada.
 * 1. Propiedades del script → agrega CONTEXTO_URL con la URL "raw" del archivo, por ejemplo:
 *    https://raw.githubusercontent.com/<tu-usuario>/pista/main/CONTEXTO.md
 * 2. Ejecuta instalarSincronizacionContexto() una vez (botón ▶ en el editor) y autoriza.
 */
function sincronizarContexto() {
  const url = PropertiesService.getScriptProperties().getProperty("CONTEXTO_URL");
  if (!url) return;
  const res = UrlFetchApp.fetch(url + "?t=" + Date.now(), { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return;
  const sh = sheet(SpreadsheetApp.getActiveSpreadsheet(), "Contexto");
  const lines = res.getContentText().split("\n");
  sh.clearContents();
  const rows = [["Copiado del repo: " + new Date().toISOString()]].concat(lines.map(l => [safe(l)]));
  sh.getRange(1, 1, rows.length, 1).setValues(rows);
  sh.setColumnWidth(1, 900);
}

function instalarSincronizacionContexto() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === "sincronizarContexto")
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("sincronizarContexto").timeBased().everyHours(1).create();
  sincronizarContexto();
}
