# Pista

Tracker de gimnasio, peso y pasos hacia los festivales. Es una PWA: se instala en la pantalla de inicio del iPhone, abre en pantalla completa y funciona sin internet.

## 1. Publicarla (GitHub Pages)

1. Crea un repo nuevo (puede ser privado solo con GitHub Pro; si no, público: el código no tiene datos tuyos).
2. Sube el proyecto a la rama `main`.
3. Settings → Pages → Source: **GitHub Actions**.
4. Cada push a `main` corre las pruebas, compila y publica. En 1–2 minutos queda en `https://<tu-usuario>.github.io/pista/`.

La ruta base `/pista/` está en `vite.config.ts`. Si le cambias el nombre al repo, cámbiala ahí también. Tiene que ser HTTPS para que funcione el modo sin internet.

## 2. Instalarla en el iPhone

Abre la URL en **Safari** → Compartir → **Agregar a pantalla de inicio**. Ábrela siempre desde ese ícono: los datos del ícono y los de Safari son espacios distintos.

## 3. Pasar tus datos desde el tracker de Claude

1. En el tracker de Claude: Plan → **Exportar mis datos**.
2. En Pista: Plan → Respaldo manual → **Importar respaldo** y elige el archivo.

## 4. Conectar Google Sheets (recomendado)

Sin esto los datos viven solo en el celular; si borras la app o cambias de teléfono, se pierden.

1. Crea una hoja de cálculo nueva en Google Sheets.
2. Extensiones → Apps Script. Borra lo que haya y pega `Code.gs`. Guarda.
3. Configuración del proyecto (engranaje) → Propiedades del script → agrega `TOKEN` con una clave larga (por ejemplo, genera una con `openssl rand -hex 24`).
4. Implementar → Nueva implementación → tipo **Aplicación web**. Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier persona**. Autoriza los permisos.
5. Copia la URL que termina en `/exec`.
6. En Pista: Plan → Google Sheets → pega la URL y la clave → **Conectar**.

La hoja queda con estas pestañas:

- `_datos`: respaldo completo que usa la app. No la edites.
- `Sesiones`, `Series`, `Cuerpo`: tablas legibles que se reescriben en cada guardado, para hacer gráficas o análisis.

Cómo sincroniza: cada vez que guardas, sube todo. Al abrir la app, trae la versión más reciente entre el celular y la hoja. Sin internet guarda en el celular y sube cuando vuelve la conexión. Está pensada para un solo usuario; si editas en dos dispositivos al mismo tiempo, gana el último que guardó.

Si cambias `Code.gs`, haz Implementar → Administrar implementaciones → editar → Nueva versión, para que la URL siga siendo la misma.

## Puente automático con el chat de claude.ai

1. En Apps Script → Propiedades del script agrega `CONTEXTO_URL` = `https://raw.githubusercontent.com/<tu-usuario>/pista/main/CONTEXTO.md`.
2. Ejecuta una vez `instalarSincronizacionContexto` (selecciónala arriba y dale ▶). Autoriza.

Desde ahí, cada hora la pestaña `Contexto` de la hoja se actualiza con lo que Claude Code dejó en `CONTEXTO.md`, y el chat lo lee desde Google Drive.

## Actualizar la app

Haz push a `main`. El service worker se regenera solo en cada build, así que no hay que subir ninguna versión a mano. La app instalada se actualiza la próxima vez que la abras.

## Desarrollo

Necesitas Node 22.

```
npm install
npm run dev      # servidor local, también visible desde el celular en la misma red
npm test         # pruebas de la lógica y de la app
npm run build    # compila a dist/
```

## Archivos

- `src/lib/`: lógica sin pantalla: fechas, plan de entrenamiento, forma del estado, respaldo y Google Sheets.
- `src/screens/` y `src/components/`: pantallas Hoy, Peso y pasos, Historial y Plan, y sus piezas.
- `src/store.tsx`: estado de la app, guardado en el celular y sincronización.
- `src/styles.css`: estilos, pensados primero para el celular.
- `public/icons/`: íconos de la app instalada.
- `vite.config.ts`: build, ruta base y PWA (manifest y service worker se generan aquí).
- `Code.gs`: backend en Google Apps Script. No se publica con la app.
