# WORK_PLAN.md

Plan de trabajo modular para LectoLab.
Este documento es la fuente de verdad para futuras sesiones con asistentes
de IA. Si algo no cuadra con AGENTS.md, este archivo manda.

Estado: Fases 1-8 completadas. Quedan las fases futuras detalladas abajo.

---

## Concepto central

La app es un contenedor de módulos. Un módulo es una herramienta que hace
una cosa concreta:

- Un motor de lectura (word, chunk, line, galactic).
- Un minijuego (schulte y los que se añadan).
- Un módulo externo que el usuario importa desde un archivo .js.

Cada módulo se registra con la misma API y aparece como una tarjeta en su
categoría. El módulo toma prestado el diseño entero de la app. Solo aporta
la lógica.

Añadir un motor nuevo: crear un archivo .js, registrarlo, agregarlo al
script del index.html. Cero HTML manual. Cero CSS manual.

---

## Lo que YA está hecho

### Fase 1: core JS

- js/core/state.js — variables globales.
- js/core/dom.js — cacheDOM() y referencias.
- js/core/text-utils.js — escapeHtml, splitSentences, splitIntoChunks,
  parseChapters, parseSegments, getChapterContent.
- js/core/preferences.js — loadPreferences, savePreferences.
- js/core/themes.js — temas core y personalizados.
- js/core/sound.js — initGameSound, playGameSound, setGameSound.
- js/core/feedback.js — sistema de aprobación inmediata multimodal.
- js/core/modules.js — registro, carga, persistencia de módulos.
- js/core/categories.js — registro de categorías core.
- js/core/navigation.js — showHome, openCategory, openModule.
- js/core/modals.js — apertura y cierre de modales.

### Fase 2: motor de lectura

- js/reading/engine.js — countdown, avance, timers.
- js/reading/controls.js — WPM, chunk size.
- js/reading/finish.js — "¡Fin!", finishReading, resetReading, togglePause.

### Fase 3: módulos de lectura

- js/modules/reading/word.js
- js/modules/reading/chunk.js
- js/modules/reading/line.js
- js/modules/reading/galactic.js

### Fase 4: minijuegos

- js/modules/games/schulte.js

### Fase 5: biblioteca

- js/library/books.js — CRUD de libros, índice de capítulos.
- js/library/covers.js — portadas generadas.

### Fase 6: bootstrap

- js/app.js

### Fase 7: CSS

Todos los archivos en styles/ y subcarpetas, con máxima fragmentación.

### Fase 8: HTML

- index.html actualizado con todos los link y script en orden.

---

## Lo que falta

### Fase 9: Continuidad de lectura por capítulos

El diseño ya está decidido y anotado. Solo falta implementarlo.

**Qué hacer:**

- Al terminar un capítulo, guardar `chapterStates[id].completed = true`
  y `chapterStates[id].wpm = wpm` en el libro.
- Al salir de un capítulo a la mitad (con "Salir" o "↻"), no guardar
  posición. El capítulo siempre empieza desde el principio la próxima
  vez.
- Mostrar palomita en el índice solo si `completed === true`.
- Mostrar WPM recordado en el índice si existe.
- Mostrar "Sin leer todavía" si no se ha abierto nunca.

**Marcado de capítulos:**

- `# Título` → capítulo (aparece en índice).
- `## Título` → subtítulo de sección (solo estilo, no aparece en índice).

**Pintado de títulos:**

- Clase `.reading-title` para capítulos.
- Clase `.reading-subtitle` para subtítulos.
- Color de acento desde `--accent-primary`.

**Archivos a tocar:**

- js/reading/finish.js — llamar a markChapterCompleted al terminar.
- js/modules/reading/*.js — reconocer segmentos de tipo title/subtitle.
- js/library/books.js — ya tiene la estructura de chapters y
  chapterStates, solo falta guardar el estado al terminar.
- styles/reading.css — ya tiene .reading-title y .reading-subtitle.

### Fase 10: Post-lectura con minijuego

El diseño está discutido pero no implementado.

**Qué hacer:**

- Nueva opción en Configuración: "Minijuego después de leer"
  (nunca / a veces / siempre). Por defecto "a veces".
- Al terminar una lectura, evaluar probabilidad.
- Si toca minijuego, abrirlo en modo "pausa activa". Instrucciones solo
  la primera vez.
- Al terminar, un solo botón "Volver al inicio". Sin repetir, sin elegir
  dificultad.
- Dificultad: la última que usó el usuario para ese minijuego.

### Fase 11: Animaciones del punto de fijación en Schulte

Configurables desde la pantalla de dificultad del juego.

**Frecuencia:** nunca / espaciada (10-20s) / normal (5-10s) / frecuente (3-5s).

**Tipos de animación:**

- Temblor (shake).
- Zoom.
- Cambio de color.
- Pulso de opacidad.
- Rotación.

Por defecto: frecuencia normal, shake/zoom/color activados,
pulse/rotate desactivados.

Guardar en localStorage con clave `schulte-dot-config`.

### Fase 12: Módulos externos

El sistema ya está implementado en js/core/modules.js. Falta la UI.

**Qué hacer:**

- Botón "+ Importar módulo" en cada categoría (ya existe el handler en
  navigation.js, apunta a openModuleImporter).
- Verificar que los módulos externos se guardan y se reinyectan bien.
- Documentar en README_CSS.md (o un README_MODULES.md nuevo) cómo
  escribir un módulo externo.

### Fase 13: Más minijuegos

Del registry actual, aún sin implementar:

- Destellos (reconocimiento rápido).
- Sacadas (movimiento ocular).
- Periférico (campo visual).
- Cuadrícula cambiante (atención).
- Memoria visual (memoria de trabajo).

Cada uno es un archivo js/modules/games/<id>.js registrado con la misma
API.

---

## Orden de implementación para futuras fases

Cuando el usuario pida continuar, el orden recomendado es:

1. **Fase 9** primero. Es la que cierra el ciclo de la biblioteca.
2. **Fase 12** después. Los módulos externos son la promesa central del
   proyecto.
3. **Fase 10** después. El post-lectura engancha los minijuegos al flujo
   de lectura.
4. **Fase 11** cuando el usuario quiera pulir Schulte.
5. **Fase 13** al final. Cada minijuego nuevo es una tarea independiente.

---

## Flujo de trabajo con el usuario

### Reglas firmes

1. Un archivo por mensaje. Nunca dos. Nunca "y además este otro".
2. Archivo completo, no fragmentos. El usuario copia y pega el archivo
   entero.
3. Sin comandos de PowerShell para crear archivos nuevos. El usuario pega
   en VS Code.
4. Sin preámbulos. Directo al código.
5. Sin preguntas intermedias. Si hay decisión, se toma y se avisa.
6. Español neutro.
7. Comentarios en español, solo donde aporten.

### Cambios en archivos existentes

- Cambio menor de 10 líneas → diff exacto.
- Cambio mayor → archivo completo.

### Reporte de bug

- Pedir mensaje exacto de consola.
- Pedir archivo y línea.
- Si es ambiguo, pedir captura del estado.
- No asumir.

### Cuando el asistente no esté seguro

- Decirlo. No inventar APIs.

---

## Cómo retomar este plan en una sesión nueva

1. Preguntar al usuario en qué fase se quedó.
2. Preguntar qué archivos ya están en disco.
3. Si todo está completo hasta la fase 8, empezar por la fase 9.
4. Seguir las "Reglas firmes" sin excepción.

No pedir contexto adicional. No proponer alternativas. Ejecutar.

---

## Notas sueltas

- correcto.mp3 se queda en la raíz.
- Los .ts antiguos se pueden conservar en _legacy/ como referencia hasta
  que el usuario decida borrarlos. No se cargan desde index.html.
- La carpeta user_modules/ aún no se crea. Se crea cuando se implemente
  la Fase 12.
- Máxima fragmentación de CSS. Ante la duda, partir un archivo en dos.
- Nada de referencias a franquicias con copyright.