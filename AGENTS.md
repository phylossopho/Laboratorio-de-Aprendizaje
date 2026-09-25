AGENTS.md
=========

Documento de contexto para agentes de IA. Leelo antes de tocar nada.

QUE ES ESTE PROYECTO

LectoLab: app web para practicar lectura y descansar la vista con
minijuegos. Es un contenedor de modulos que se anaden, quitan o
sustituyen sin tocar el resto.

Publico: ninos, algunos con lentes, algunos con TDAH.

REGLAS DE DISENO

- Sin competencia, sin presion, sin frustracion.
- Sin cronometros regresivos, sin penalizaciones por error.
- Sin mensajes condescendientes. Tono neutral y calido.
- Sin estrellas, insignias ni puntuaciones.
- Contraste minimo 4.5:1. Tamanos legibles.
- Errores silenciosos en minijuegos. Un clic erroneo no hace nada.
- Feedback inmediato al acertar: sonido + pop + onda radial.

STACK

- JavaScript puro. HTML y CSS.
- Sin TypeScript, sin compilacion, sin npx tsc.
- Sin frameworks, sin bundlers, sin backend, sin npm.
- Sin import ni export. Todo es global.
- Despliegue en GitHub Pages.

ESTRUCTURA

LectoLab/
  index.html
  correcto.mp3
  AGENTS.md
  WORK_PLAN.md
  ARCHITECTURE.md
  README_CSS.md
  styles/
    base.css, utilities.css, typography.css
    buttons.css, forms.css, animations.css, controls.css
    reading.css, countdown.css
    modals.css, custom-themes.css
    home.css, category.css, library.css
    module-shell.css, games.css, feedback.css
    themes/ (pizarron, crepusculo, papel, basketball)
    responsive/ (tablet, mobile, mobile-narrow)
  js/
    app.js
    core/ (state, dom, preferences, themes, sound, feedback,
           text-utils, modules, categories, navigation, modals)
    reading/ (engine, controls, finish)
    modules/reading/ (word, chunk, line, galactic)
    modules/games/ (schulte)
    library/ (books, covers)

CONVENCIONES

- JS puro. Sin clases salvo que aporten claridad.
- var en nivel superior. let dentro de funciones.
- Nombres tecnicos en ingles. Dominio en espanol.
- Funciones de maximo 40 lineas.
- Archivos de 50 a 250 lineas.
- Comentarios en espanol neutro.
- UI en espanol neutro. Tu, no vos.

LO QUE NO SE HACE

- No frameworks (React, Vue, Svelte, jQuery).
- No bundlers (Webpack, Vite, Rollup).
- No TypeScript. No package.json. No node_modules.
- No import ni export.
- No alert() salvo emergencia.
- No cronometros, puntuaciones, records, mensajes motivacionales.
- No penalizar errores.
- No romper las claves de localStorage existentes.
- No usar el termino Star Wars. Es modo galactico.

PREFERENCIAS DEL USUARIO

- Espanol neutro siempre.
- Diff exacto para cambios pequenos. Archivo completo solo si es
  reemplazo real.
- Explicar el porque del cambio.
- Avisar antes de reemplazar un archivo entero.
- Respetar el codigo existente. Ampliar, no rehacer.
- PowerShell: leer con -Encoding UTF8, escribir con
  [System.IO.File]::WriteAllText($path, $c,
  [System.Text.UTF8Encoding]::new($false)).

DECISIONES CERRADAS

- Modo galactico con paleta fija, ignora el tema activo.
- Sonido de minijuegos apagado por defecto.
- Controles se atenuan tras 2 segundos de inactividad.
- Temas personalizados con input type=file multiple y drag-drop.
  Sin webkitdirectory.
- Schulte sin cronometro ni castigo.
- Contador de tablas por dificultad, no global.
- Capitulos marcados con # Titulo.
- Al abrir un capitulo, siempre empieza desde el principio.
- Navegacion: usar `goBack()` como unico boton de retroceso general.
- Tarjetas: usar siempre el componente BEM existente `.card` + `.card-container`.
- Flujo de lectura: el picker de texto solo muestra la biblioteca, sin ingreso manual.
- Juegos/modulos: al cerrar, usar `goBack()` para volver a la pantalla anterior.
- Debug: FAB flotante copiador, activado por defecto en pruebas, ocultable con `Ctrl+Shift+D` o `hidden`.

PREGUNTA DE DISENO

Ante dudas:

  Esto ayuda a un nino con TDAH a practicar lectura sin frustrarse,
  con feedback inmediato al acertar?

Si si, va. Si no, se descarta.