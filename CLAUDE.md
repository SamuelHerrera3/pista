# Pista — contexto para Claude Code

App personal de Samuel (Medellín) para registrar entrenamiento, peso y pasos mientras se prepara para 4 festivales de música electrónica. Samuel planea y decide en el chat de claude.ai (proyecto "gym"); aquí se construye. Responde en español.

## Regla de sincronización (obligatoria, sin que Samuel lo pida)
`CONTEXTO.md` es el puente con el chat de claude.ai, que no puede ver este PC. Un Apps Script lo copia cada hora a la hoja de Google Sheets de Pista, y desde ahí lo lee el chat.
- Al empezar una sesión: léelo.
- Al terminar cualquier cambio, aunque sea pequeño: actualiza "Estado", agrega una línea fechada en "Decisiones" y ajusta "Pendientes". Haz commit y push en el mismo paso. Nunca cierres una tarea sin esto.
- Si Samuel pega un bloque "Decisión del chat", aplícalo y regístralo igual.
- Mantenlo corto: menos de 80 líneas. Resume lo viejo en vez de acumular.

## Qué es
- PWA estática: `index.html` (HTML+CSS+JS en un solo archivo), `sw.js`, `manifest.webmanifest`, `icons/`.
- Publicada en GitHub Pages desde `main` / root.
- Datos: `localStorage` (`pista-tracker-v1`) y, opcional, Google Sheets vía `Code.gs` (Apps Script, POST con `token`; acciones `load`/`save`; pestañas `_datos`, `Sesiones`, `Series`, `Cuerpo`). Sincroniza por `state.updatedAt` (gana el más reciente).
- Forma del estado: `{sessions:[{id,date,type,walked,cardioMin,coreDone,stretchDone,notes,exercises:[{name,sets:[{kg,reps}]}]}], body:[{date,weight,waist,steps}], updatedAt}`. No romper esta forma sin migración: hay datos reales.

## Reglas
- Al cambiar `index.html`, sube `VERSION` en `sw.js` (`pista-v2`, `pista-v3`…).
- Paleta: negros, grises y verdes (menta `--primary`, lima `--accent`). UX aprobada; no rediseñar sin que lo pida.
- El plan (rutina PPL, fechas de festivales, reglas de descarga) vive en `FESTS`, `ROUTINES` y `planFor()` en `index.html`.
- Nunca subir el TOKEN ni la URL del Apps Script al repo.
