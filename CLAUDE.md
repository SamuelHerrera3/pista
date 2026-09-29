# Pista — contexto para Claude Code

App personal de Samuel (Medellín) para registrar entrenamiento, peso y pasos mientras se prepara para 4 festivales de música electrónica. Samuel planea y decide en el chat de claude.ai (proyecto "gym"); aquí se construye. Responde en español.

## Regla de sincronización (obligatoria, sin que Samuel lo pida)
`CONTEXTO.md` es el puente con el chat de claude.ai, que no puede ver este PC. Un Apps Script lo copia cada hora a la hoja de Google Sheets de Pista, y desde ahí lo lee el chat.
- Al empezar una sesión: léelo.
- Al terminar cualquier cambio, aunque sea pequeño: actualiza "Estado", agrega una línea fechada en "Decisiones" y ajusta "Pendientes". Haz commit y push en el mismo paso. Nunca cierres una tarea sin esto.
- Si Samuel pega un bloque "Decisión del chat", aplícalo y regístralo igual.
- Mantenlo corto: menos de 80 líneas. Resume lo viejo en vez de acumular.

## Qué es
- PWA en React + TypeScript con Vite, mobile first. Código en `src/`: `lib/` (lógica pura: fechas, plan, estado, Sheets), `screens/` (Hoy, Cuerpo, Historial, Plan), `components/`, `store.tsx` (estado, guardado local y sync), `styles.css`.
- `public/icons/` tiene los íconos. El service worker y el manifest los genera `vite-plugin-pwa`: no se editan a mano.
- Se publica en GitHub Pages con GitHub Actions (`.github/workflows/deploy.yml`) al hacer push a `main`. La ruta base es `/pista/`.
- Comandos: `npm run dev`, `npm test`, `npm run build`.
- Datos: `localStorage` (`pista-tracker-v1`) y, opcional, Google Sheets vía `Code.gs` (Apps Script, POST con `token`; acciones `load`/`save`; pestañas `_datos`, `Sesiones`, `Series`, `Cuerpo`). Sincroniza por `state.updatedAt` (gana el más reciente).
- Forma del estado: `{sessions:[{id,date,type,walked,cardioMin,coreDone,stretchDone,notes,exercises:[{name,sets:[{kg,reps}]}]}], body:[{date,weight,waist,steps}], updatedAt}`. No romper esta forma sin migración: hay datos reales.

## Reglas
- Antes de cada commit corre `npm test` y `npm run build`. Las pruebas comparan `planFor` con la versión anterior y protegen la forma del estado.
- Mobile first: diseña para 375–402 px y respeta las áreas seguras del iPhone (`env(safe-area-inset-*)`). Las grillas usan `minmax(0, 1fr)` y los inputs 16 px para que iOS no haga zoom ni desborde.
- Paleta: negros, grises y verdes (menta `--primary`, lima `--accent`). UX aprobada; no rediseñar sin que lo pida.
- El plan (rutina PPL, fechas de festivales, reglas de descarga) vive en `FESTS`, `ROUTINES` y `planFor()` en `src/lib/plan.ts`.
- Nunca subir el TOKEN ni la URL del Apps Script al repo.
