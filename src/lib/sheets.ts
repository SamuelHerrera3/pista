import { CFG_KEY } from "./state";
import type { AppState, SyncConfig } from "./types";

export function loadCfg(): SyncConfig {
  try {
    return JSON.parse(localStorage.getItem(CFG_KEY) ?? "null") || {};
  } catch {
    return {};
  }
}

export function saveCfg(cfg: SyncConfig) {
  try {
    localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
  } catch {
    /* ignore */
  }
}

export const SCRIPT_URL_RE = /^https:\/\/script\.google\.com\/.+\/exec$/;

export type SheetsReply = { ok: boolean; error?: string; state?: unknown };

export async function callSheets(
  cfg: SyncConfig,
  body: { action: "load" } | { action: "save"; state: AppState }
): Promise<SheetsReply> {
  let j: SheetsReply;
  try {
    const r = await fetch(cfg.url!, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token: cfg.token, ...body })
    });
    j = await r.json();
  } catch {
    throw new Error("no respondió. Revisa la URL y que el acceso sea «Cualquier persona»");
  }
  if (!j.ok) throw new Error(j.error === "token" ? "La clave no coincide con la del script" : j.error || "Error en el script");
  return j;
}
