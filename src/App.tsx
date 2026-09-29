import { useState } from "react";
import { Hero } from "./components/Hero";
import { TabBar, type Tab } from "./components/TabBar";
import { Toast } from "./components/Toast";
import { Cuerpo } from "./screens/Cuerpo";
import { Historial } from "./screens/Historial";
import { Hoy } from "./screens/Hoy";
import { Plan } from "./screens/Plan";
import { PistaProvider } from "./store";

export default function App() {
  const [tab, setTab] = useState<Tab>("hoy");

  const go = (t: Tab) => {
    setTab(t);
    window.scrollTo(0, 0);
  };

  return (
    <PistaProvider>
      <div className="app">
        <Hero />
        <main id="view" role="tabpanel">
          {tab === "hoy" && <Hoy />}
          {tab === "cuerpo" && <Cuerpo />}
          {tab === "historial" && <Historial onOpen={() => go("hoy")} />}
          {tab === "plan" && <Plan />}
        </main>
      </div>
      <TabBar tab={tab} onTab={go} />
      <Toast />
    </PistaProvider>
  );
}
