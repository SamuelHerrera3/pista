# Contexto compartido — Pista

Última actualización: 2026-09-29 (Claude Code)

## Estado
- v2 en React + TypeScript (Vite, mobile first) publicada en línea desde main (repo público SamuelHerrera3/pista). Pages se despliega con GitHub Actions.
- App: https://samuelherrera3.github.io/pista/ (abrir en Safari del iPhone y agregar a pantalla de inicio).
- URL raw de este archivo (para CONTEXTO_URL en el Apps Script): https://raw.githubusercontent.com/SamuelHerrera3/pista/main/CONTEXTO.md
- Sheets: conectado y sincronizando desde el iPhone (cuenta personal de Google). La app avisa al conectar o si falla.
- Datos actuales de Samuel: en el tracker de Claude (artifact). Migrar con Exportar → Importar.

## Plan vigente
- Rutina PPL. Semana base desde el 5 oct: lun Legs, mar zona 2, mié Push, jue intervalos, vie Pull, sáb caminata larga, dom descanso. Core en cada día de fuerza.
- Va caminando al gimnasio de Arkadia (~3,8 km ida y vuelta).
- Festivales: 31 oct, 15 nov, 30 nov, 15 dic (fechas estimadas, 15 días entre cada uno; confirmar).
- Descarga: 5–6 días antes mitad de series; 2 días antes ligero sin piernas; día antes descanso; 1–2 días después recuperación.
- Comida: ~2.000–2.100 kcal, 130–150 g de proteína.

## Decisiones
- 2026-09-29: PWA propia con localStorage + Google Sheets opcional. Paleta negros/grises/verdes.
- 2026-09-29: Publicada en GitHub Pages (main / root). Al publicar se corrigieron nombres de archivo cruzados y se creó sw.js (VERSION pista-v1). Verificados en 200: index.html, manifest.webmanifest, sw.js e íconos.
- 2026-09-29: Migración a React. Misma UX, misma forma de estado y mismas claves de localStorage (`pista-tracker-v1`, `pista-sync-v1`), así que los datos existentes siguen. Layout rehecho para iPhone: áreas seguras, grillas sin desborde, barra inferior sin cortes. Pruebas: `planFor` igual a v1 en 113 días, forma del estado, respaldo y flujos principales.
- 2026-09-29: v2 fusionada en main (PR 1) y Pages cambiado a GitHub Actions. Sitio verificado en 200 (index, manifest, sw.js, íconos).
- 2026-09-29: Apps Script desplegado con la cuenta personal y acceso "Cualquier persona" (con cuenta de trabajo pedía sesión). Sheets conectado desde la app. Se agregó un aviso al conectar.

## Pendientes
- Probar v2 en el iPhone: abrir el ícono dos veces para que tome la versión nueva y revisar que no haya elementos montados.
- Confirmar fechas reales de los festivales.
