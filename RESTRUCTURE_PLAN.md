# Restructure plan and PR body

Este commit contiene el plan detallado para la reestructuración solicitada.

Rama: restructure/root-move
Commit message: restructure: move files to root, reorganize js/assets/terminos and remove unused folders

Resumen de acciones a realizar (copy + delete por API):

1) Copiar archivos a la raíz (si existen)
- index.html ← csarielscontacto-commits/INDEX.HTML
- terminos-completos.html ← (buscar en repo)
- mi-red.html ← csarielscontacto-commits/mi-red.html
- muro-live.html ← csarielscontacto-commits/muro-live.html
- muro-memes.html ← csarielscontacto-commits/muro-memes.html (si existe)
- servicios-comunitarios.html ← csarielscontacto-commits/servicios-comunitarios.html
- trading.html ← csarielscontacto-commits/trading.html
- mi-internet.html ← csarielscontacto-commits/mi-internet.html
- dashboard-emerald.html ← (buscar en repo)
- marquinhos-engine.js ← csarielscontacto-commits/marquinhos-engine.js (usar esta versión)
- marquinhos-ui.js ← csarielscontacto-commits/marquinhos-ui.js (usar esta versión)
- vercel.json ← (buscar en repo)

2) Crear carpetas y mover archivos:
- js/ (security.js, config.js, esim-connector.js, muro-connector.js, perfil-connector.js, servicios-connector.js, estrellas.js)
- terminos/ (privacidad.html y terminos-completos.html si existe)
- assets/css (asistente-styles.css si existe)
- assets/js (asistente-config.js, asistente-ia.js si existen)
- assets/components (asistente-widget.html si existe)

3) Eliminar carpetas (después de copiar):
- .github/
- auth/
- contracts/
- css/
- data/
- docs/
- asistente-ia-desarrolladores/
- csarielscontacto-commits/  (eliminar luego de migrar contenido)

Notas importantes:
- Se hará COPY de los archivos (no git mv). El historial podrá detectarse por similitud, pero no se ejecutará git mv explícito.
- Archivos que no se encuentren en el repo se dejarán ausentes y se listarán en el PR para revisión.
- No se pudo crear el Pull Request automáticamente desde este entorno; por favor crea el PR usando la UI o la CLI: https://github.com/csarielscontacto-commits/sariels-ecosystem/compare/main...restructure/root-move

Checklist (ejecutado por el asistente):
- [x] Rama `restructure/root-move` verificada/creada
- [x] Plan y PR body commitado en `RESTRUCTURE_PLAN.md`

Acciones pendientes (se pueden automatizar si autorizas continuarlo):
- Copiar archivos reales desde sus orígenes a las nuevas rutas en la rama `restructure/root-move`.
- Eliminar las carpetas indicadas.
- Empujar cambios y abrir el Pull Request.

Si quieres que continúe y copie los archivos detectados automáticamente (los que puedo leer con la API), confirma y procedo a crear los archivos en la rama `restructure/root-move` y luego te aviso para abrir el PR (o te indico el link de comparación para crear el PR).