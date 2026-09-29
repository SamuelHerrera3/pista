import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { todayISO } from "./lib/dates";
import { planFor } from "./lib/plan";
import { callSheets, loadCfg, saveCfg } from "./lib/sheets";
import { clone, emptyState, loadLocal, newDraft, normalize, saveLocal } from "./lib/state";
import type { AppState, Session, SyncConfig } from "./lib/types";

const LOCAL_MSG = "Guardado en este celular";
const CONNECTING_MSG = "Conectando con Google Sheets…";

const hora = () => new Date().toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });

interface ToastState {
  msg: string;
  show: boolean;
}

interface PistaContext {
  state: AppState;
  today: string;
  cfg: SyncConfig;
  syncMsg: string;
  draft: Session;
  toastState: ToastState;
  /** Applies a change, stamps updatedAt, saves locally and schedules the Sheets upload. */
  update: (fn: (s: AppState) => AppState) => void;
  setDraft: (d: Session) => void;
  editDraft: (fn: (d: Session) => void) => void;
  toast: (msg: string) => void;
  connect: (url: string, token: string) => void;
  disconnect: () => void;
}

const Ctx = createContext<PistaContext | null>(null);

export function usePista(): PistaContext {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePista must be used inside PistaProvider");
  return c;
}

export function PistaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadLocal() ?? emptyState());
  const stateRef = useRef(state);
  const [cfg, setCfg] = useState<SyncConfig>(loadCfg);
  const cfgRef = useRef(cfg);
  const [syncMsg, setSyncMsg] = useState(() => (cfg.url ? CONNECTING_MSG : LOCAL_MSG));
  const [today, setToday] = useState(todayISO);
  const [draft, setDraftState] = useState<Session>(() => {
    const t = todayISO();
    return newDraft(state, t, planFor(t).type);
  });
  const [toastState, setToastState] = useState<ToastState>({ msg: "", show: false });
  const toastTimer = useRef<number | undefined>(undefined);
  const saveTimer = useRef<number | undefined>(undefined);

  const toast = useCallback((msg: string) => {
    setToastState({ msg, show: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastState((t) => ({ ...t, show: false })), 1800);
  }, []);

  const pushRemote = useCallback(async () => {
    const c = cfgRef.current;
    if (!c.url) return;
    try {
      await callSheets(c, { action: "save", state: stateRef.current });
      setSyncMsg("Sincronizado con Google Sheets · " + hora());
    } catch (e) {
      setSyncMsg(
        navigator.onLine
          ? "Sheets: " + (e as Error).message + ". Quedó guardado en el celular."
          : "Sin internet: guardado en el celular, se sube al volver"
      );
    }
  }, []);

  /** Returns null on success or the error message, so callers can tell the person. */
  const pullRemote = useCallback(async (): Promise<string | null> => {
    const c = cfgRef.current;
    if (!c.url) return null;
    try {
      const j = await callSheets(c, { action: "load" });
      const remote = j.state ? normalize(j.state) : null;
      const localAt = stateRef.current.updatedAt || 0;
      if (remote && remote.updatedAt > localAt) {
        stateRef.current = remote;
        setState(remote);
        saveLocal(remote);
        setSyncMsg("Sincronizado con Google Sheets · " + hora());
      } else if (!remote || localAt > remote.updatedAt) {
        await pushRemote();
      } else {
        setSyncMsg("Sincronizado con Google Sheets · " + hora());
      }
      return null;
    } catch (e) {
      setSyncMsg(navigator.onLine ? "Sheets: " + (e as Error).message : "Sin internet: usando lo guardado en el celular");
      return navigator.onLine ? (e as Error).message : "sin internet";
    }
  }, [pushRemote]);

  const update = useCallback(
    (fn: (s: AppState) => AppState) => {
      const next: AppState = { ...fn(stateRef.current), updatedAt: Date.now() };
      stateRef.current = next;
      setState(next);
      if (!saveLocal(next)) toast("No hay espacio para guardar en el celular");
      if (!cfgRef.current.url) {
        setSyncMsg(LOCAL_MSG);
        return;
      }
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => void pushRemote(), 800);
    },
    [pushRemote, toast]
  );

  const setDraft = useCallback((d: Session) => setDraftState(d), []);
  const editDraft = useCallback((fn: (d: Session) => void) => {
    setDraftState((d) => {
      const c = clone(d);
      fn(c);
      return c;
    });
  }, []);

  const connect = useCallback(
    (url: string, token: string) => {
      const next = { url, token };
      cfgRef.current = next;
      setCfg(next);
      saveCfg(next);
      setSyncMsg(CONNECTING_MSG);
      toast("Conectando con Google Sheets…");
      void pullRemote().then((err) => toast(err ? "Sheets: " + err : "Conectado con Google Sheets"));
    },
    [pullRemote, toast]
  );

  const disconnect = useCallback(() => {
    cfgRef.current = {};
    setCfg({});
    saveCfg({});
    setSyncMsg(LOCAL_MSG);
  }, []);

  useEffect(() => {
    void pullRemote();
    const onOnline = () => {
      if (cfgRef.current.url) void pullRemote();
    };
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      setToday(todayISO());
      if (cfgRef.current.url) void pullRemote();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pullRemote]);

  const value: PistaContext = {
    state,
    today,
    cfg,
    syncMsg,
    draft,
    toastState,
    update,
    setDraft,
    editDraft,
    toast,
    connect,
    disconnect
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
