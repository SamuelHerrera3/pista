import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { LS_KEY } from "./lib/state";
import type { AppState } from "./lib/types";
import { LEGACY_STATE } from "./test/fixtures";

const stored = (): AppState => JSON.parse(localStorage.getItem(LS_KEY) ?? "null");

describe("App", () => {
  it("shows the four tabs and starts on Hoy", () => {
    render(<App />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["Hoy", "Peso y pasos", "Historial", "Plan"]);
    expect(screen.getByRole("tab", { name: "Hoy" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/El plan dice:/)).toBeInTheDocument();
  });

  it("loads a state saved by the previous version and shows it in Historial", async () => {
    localStorage.setItem(LS_KEY, JSON.stringify(LEGACY_STATE));
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Historial" }));
    expect(screen.getByText("Buen día")).toBeInTheDocument();
    expect(screen.getAllByText("Press con mancuernas en banco plano").length).toBeGreaterThan(0);
  });

  it("saves a body record in the persisted shape", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Peso y pasos" }));
    await userEvent.type(screen.getByLabelText("Peso (kg)"), "78,5");
    await userEvent.type(screen.getByLabelText("Pasos"), "9500");
    await userEvent.click(screen.getByRole("button", { name: "Guardar registro" }));
    const s = stored();
    expect(s.body).toHaveLength(1);
    expect(s.body[0]).toMatchObject({ weight: 78.5, waist: null, steps: 9500 });
    expect(s.updatedAt).toBeGreaterThan(0);
    expect(screen.getByRole("status")).toHaveTextContent("Registro guardado");
  });

  it("asks for at least one value before saving a body record", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Peso y pasos" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar registro" }));
    expect(screen.getByRole("status")).toHaveTextContent("Escribe al menos un dato");
    expect(stored()).toBeNull();
  });

  it("saves a strength session with numeric sets and the date_type id", async () => {
    localStorage.clear();
    render(<App />);
    await userEvent.selectOptions(screen.getByLabelText("Sesión"), "push");
    const kg = screen.getAllByLabelText("kg serie 1")[0];
    const reps = screen.getAllByLabelText("reps serie 1")[0];
    await userEvent.type(kg, "22,5");
    await userEvent.type(reps, "10");
    await userEvent.click(screen.getByRole("button", { name: "Guardar sesión" }));
    const s = stored();
    expect(s.sessions).toHaveLength(1);
    expect(s.sessions[0].id).toMatch(/^\d{4}-\d{2}-\d{2}_push$/);
    expect(s.sessions[0].exercises[0].sets[0]).toEqual({ kg: 22.5, reps: 10 });
    expect(s.sessions[0].exercises[0].sets[1]).toEqual({ kg: null, reps: null });
  });

  it("keeps the decimal separator while typing", async () => {
    render(<App />);
    await userEvent.selectOptions(screen.getByLabelText("Sesión"), "push");
    const kg = screen.getAllByLabelText("kg serie 1")[0] as HTMLInputElement;
    await userEvent.type(kg, "7,");
    expect(kg.value).toBe("7,");
  });

  it("adds and removes sets", async () => {
    render(<App />);
    await userEvent.selectOptions(screen.getByLabelText("Sesión"), "push");
    const before = screen.getAllByLabelText(/^kg serie/).length;
    await userEvent.click(screen.getAllByRole("button", { name: "+ serie" })[0]);
    expect(screen.getAllByLabelText(/^kg serie/).length).toBe(before + 1);
    await userEvent.click(screen.getAllByRole("button", { name: "Quitar serie" })[0]);
    expect(screen.getAllByLabelText(/^kg serie/).length).toBe(before);
  });

  it("reopens a saved session from Historial", async () => {
    localStorage.setItem(LS_KEY, JSON.stringify(LEGACY_STATE));
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Historial" }));
    const card = screen.getByText("Buen día").closest("section")!;
    await userEvent.click(within(card).getByRole("button", { name: "Abrir" }));
    expect(screen.getByRole("tab", { name: "Hoy" })).toHaveAttribute("aria-selected", "true");
    expect((screen.getByLabelText("Fecha") as HTMLInputElement).value).toBe("2026-09-22");
  });

  it("imports a backup file", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Plan" }));
    const file = new File([JSON.stringify({ app: "pista", version: 1, state: LEGACY_STATE })], "b.json", { type: "application/json" });
    await userEvent.upload(screen.getByLabelText(/Importar respaldo/), file);
    await vi.waitFor(() => expect(stored()?.sessions).toHaveLength(2));
    expect(stored().body).toHaveLength(2);
  });

  it("tells the person when Sheets connects and when the key is wrong", async () => {
    const url = "https://script.google.com/macros/s/ABC/exec";
    const reply = (body: unknown) => vi.fn().mockResolvedValue({ json: async () => body });
    vi.stubGlobal("fetch", reply({ ok: true, state: null }));
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Plan" }));
    await userEvent.type(screen.getByLabelText("URL del script"), url);
    await userEvent.type(screen.getByLabelText("Clave (TOKEN)"), "abc");
    await userEvent.click(screen.getByRole("button", { name: "Conectar" }));
    await vi.waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Conectado con Google Sheets"));

    vi.stubGlobal("fetch", reply({ ok: false, error: "token" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar y sincronizar" }));
    await vi.waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("La clave no coincide"));
    vi.unstubAllGlobals();
  });

  it("rejects a Sheets URL that does not end in /exec", async () => {
    render(<App />);
    await userEvent.click(screen.getByRole("tab", { name: "Plan" }));
    await userEvent.type(screen.getByLabelText("URL del script"), "https://example.com/x");
    await userEvent.type(screen.getByLabelText("Clave (TOKEN)"), "abc");
    await userEvent.click(screen.getByRole("button", { name: "Conectar" }));
    expect(screen.getByRole("status")).toHaveTextContent("La URL debe terminar en /exec");
  });
});
