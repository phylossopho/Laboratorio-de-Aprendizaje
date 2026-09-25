ARCHITECTURE.md
===============

Como se conectan los archivos de LectoLab y por que existen.

IDEAS CENTRAL

LectoLab es un contenedor de modulos.

La app no sabe que es "palabra por palabra" ni "tabla de Schulte".
Solo sabe registrar modulos y mostrarlos como tarjetas. Cada modulo
se declara a si mismo, dice en que categoria vive y que hacer cuando
el usuario lo abre. La app se encarga del resto: navegacion, temas,
persistencia, feedback.

Anadir una herramienta nueva no requiere tocar la app. Solo se crea
su archivo, se registra, y aparece automaticamente.

CUATRO CAPAS

  Modulos      (word, chunk, schulte)
       arriba
  Categorias   (lectura, minijuegos, textos)
       arriba
  Core         (state, dom, modules, navigation)
       arriba
  Bootstrap    (app.js)

Cada capa solo depende de las capas inferiores. Un modulo puede
llamar al core, pero el core no sabe nada de los modulos especificos.

CAPA 1: BOOTSTRAP (js/app.js)

Punto de entrada. El ultimo script que se ejecuta. Al arrancar hace:

  1. cacheDOM() - captura referencias del DOM.
  2. loadCustomThemesFromStorage() - carga temas personalizados.
  3. loadPreferences() - carga preferencias.
  4. initGameSound() - prepara el sonido.
  5. loadUserModulesFromStorage() - reinyecta modulos externos.
  6. bindThemeFileInput() / bindThemeDropZone() - listeners de temas.
  7. bindGlobalEvents() - teclado y eventos globales.
  8. bindControls() - fade de la barra de controles.
  9. showHome() - muestra la pantalla de inicio.

El orden importa. Los temas y preferencias se cargan antes de mostrar
nada. Los modulos se registran antes que showHome().

CAPA 2: CORE

Once archivos, cada uno con una responsabilidad.

state.js
  Variables globales. Sin logica. Todo lo que la app recuerda esta
  aqui: modo, preferencias, texto, referencias al DOM, timers.

dom.js
  cacheDOM() recorre el HTML y asigna cada elemento con id a una
  variable global. Se llama una vez al arrancar.

text-utils.js
  Funciones puras de texto:
  - escapeHtml(s)
  - splitSentences(text)
  - splitIntoChunks(text, size)
  - parseChapters(text)
  - parseSegments(text)
  - getChapterContent(fullText, chapter)

preferences.js
  loadPreferences() y savePreferences(). Todo lo que persiste entre
  sesiones pasa por aqui.

themes.js
  Temas core (Pizarron, Crepusculo, Papel) y temas personalizados
  que el usuario carga desde archivos css. Aplica clases al body.

sound.js
  Un solo sonido: correcto.mp3. Tres modos: off, soft, on.

feedback.js
  Sistema de aprobacion inmediata para TDAH. Combina cinco senales:
  sonido, onda radial, pulso local, pulso en contador, micro-movimiento.
  API: feedbackFull(x, y), feedbackSound(), feedbackPulse(el),
  feedbackRipple(x, y), feedbackLocal(el).

modules.js
  El corazon del sistema. Registra modulos y categorias, los
  persiste, los carga al arrancar.
  Estructuras: MODULES, CATEGORIES, MODULE_ORDER.
  Funciones clave:
  - registerModule(def)
  - registerCategory(def)
  - getModulesByCategory(catId)
  - loadUserModulesFromStorage()
  - importUserModuleFromFile(file)
  - injectUserModule(code, source)

categories.js
  Registra las tres categorias core al cargar:
  reading, games, texts.

navigation.js
  Controla que pantalla se ve. Funciones:
  - showHome()
  - openCategoryScreen(id)
  - openModuleScreen(id)
  - backToHome()
  - buildContext(mod, text) - construye el ctx que reciben los modulos.

modals.js
  Abre y cierra modales. Aplica opciones de UI.

CAPA 3: CATEGORIAS

Una categoria agrupa modulos con un proposito. Estan declaradas en
categories.js. Cada una tiene id, name, icon, description, order y
open().

Las tres actuales:
  - Lectura veloz -> grid de motores de lectura.
  - Minijuegos -> grid de minijuegos.
  - Textos -> biblioteca personal.

Anadir una categoria nueva es registrarla en categories.js.

CAPA 4: MODULOS

Un modulo es una herramienta registrable. Cada uno vive en su archivo
dentro de js/modules/categoria/.

Anatomia de un modulo:

  registerModule({
      id: 'word',
      category: 'reading',
      name: 'Palabra por palabra',
      icon: 'Aa',
      description: '...',
      hint: 'Para: velocidad pura',
      order: 1,
      shell: 'reading',
      render: function (ctx) {},
      schedule: function (ctx) {},
      reschedule: function (ctx) {},
      stop: function () {}
  });

Tres shells:
  reading - barra con WPM y chunk size.
  game    - barra con pausa, reiniciar, sonido, salir.
  custom  - contenedor vacio.

El contexto (ctx) que recibe un modulo:

  ctx.container
  ctx.text
  ctx.words, ctx.chunks, ctx.sentences
  ctx.wpm, ctx.fontSize, ctx.chunkSize, ctx.theme
  ctx.module
  ctx.feedback(x, y)
  ctx.playSound()
  ctx.close()

Un modulo no tiene acceso a localStorage, ni al DOM fuera de su
contenedor, ni a otras partes de la app.

FLUJO DE UNA SESION

  1. Usuario abre la app.
  2. app.js arranca, carga preferencias, modulos, temas.
  3. showHome() muestra el grid de categorias.
  4. Usuario pulsa Lectura veloz.
  5. openCategoryScreen('reading') muestra el grid de motores.
  6. Usuario pulsa Palabra por palabra.
  7. openModuleScreen('word') monta el shell de lectura.
  8. Sin texto cargado, abre el modal de configurar texto.
  9. Usuario pega un texto y pulsa Empezar a leer.
  10. startWithConfig() llama a startReading().
  11. Cuenta regresiva 3-2-1.
  12. renderWordDisplay() dibuja la primera palabra.
  13. scheduleWordNext() agenda la siguiente.
  14. Al terminar, finishReading() muestra Fin.
  15. Tras 1.9 segundos, backToHome() vuelve al inicio.

FLUJO DE ANADIR UN MODULO

Opcion A - modulo interno (codigo):
  1. Crear js/modules/categoria/id.js.
  2. Llamar a registerModule({...}).
  3. Anadir el script en index.html antes de app.js.

Opcion B - modulo externo (usuario):
  1. Usuario pulsa Importar modulo en la categoria.
  2. Selecciona un archivo js.
  3. importUserModuleFromFile() lo lee, lo inyecta, captura
     registerModule.
  4. Se guarda en localStorage.
  5. Al recargar, loadUserModulesFromStorage() lo reinyecta.

FLUJO DE LA BIBLIOTECA

  1. Usuario entra a Textos.
  2. renderLibraryScreen() muestra los libros guardados.
  3. Cada libro tiene una portada generada.
  4. Si el libro tiene capitulos (marcados con # Titulo), al pulsarlo
     se muestra el indice.
  5. El indice muestra: check leido, circulo no leido, WPM recordado.
  6. Al pulsar un capitulo, se abre el modulo preferido con el texto
     de ese capitulo.
  7. Al terminar el capitulo, se marca como completado.

SISTEMA DE TEMAS

  1. :root en base.css define variables de fallback (Pizarron).
  2. Cada tema core es un archivo styles/themes/id.css con
     body.theme-id { ... }.
  3. Los temas personalizados se cargan desde archivos css del usuario.
  4. applyTheme() anade theme-id al body. La cascada CSS hace el resto.
  5. Los modulos usan variables CSS sin saber que tema esta activo.

El modo galactico ignora el tema y usa su paleta fija.

SISTEMA DE FEEDBACK (TDAH)

  1. Un modulo detecta un acierto.
  2. Llama a ctx.feedback(x, y) con la posicion del clic.
  3. feedback.js dispara cinco senales simultaneas:
     - Sonido.
     - Onda radial desde (x, y).
     - Pulso en el elemento tocado.
     - Pulso en el contador principal.
     - Micro-movimiento del contador de progreso.
  4. Si el usuario tiene prefers-reduced-motion, se apaga todo
     excepto el sonido y el cambio de color.

PERSISTENCIA (LOCALSTORAGE)

Claves usadas:

  reading-theme
  reading-sliderPos
  reading-controlSize
  reading-mode
  reading-mode-prefs
  reading-gameSound
  reading-custom-themes
  lectolab-library
  lectolab-user-modules
  schulte-completed-3, schulte-completed-4, schulte-completed-5
  schulte-dot-config

Las claves con prefijo reading- son compatibles con la version
anterior. No se renombran para no perder preferencias.

POR QUE ESTA ARQUITECTURA

Tres razones:

1. Archivos pequenos. Ninguno supera 250 lineas. Los agentes de IA
   pueden leerlos completos sin perder contexto. Las personas los
   entienden en un minuto.

2. Responsabilidad unica. Cada archivo hace una cosa. Cambiar el
   sistema de temas no toca la navegacion. Anadir un modulo no toca
   el core.

3. Extensible. Anadir un modulo, categoria o tema es una tarea
   acotada. No requiere refactorizar nada existente.