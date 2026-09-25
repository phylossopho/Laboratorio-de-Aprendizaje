# Estado de sesión — LectoLab

## Proyecto
LectoLab es una app web de lectura para niños (incluyendo algunos con lentes y/o TDAH).
Stack: HTML, CSS y JavaScript puro. Sin frameworks, sin bundlers, sin backend.
Todo el código es global; los módulos se registran con `registerModule(def)`.

## Perfil experto requerido

El agente debe comportarse como experto en:
- UI/UX con comportamiento y diseño equivalente a cualquier app de Android nativa.
- Programación en JavaScript.
- CSS.
- HTML.
- Educación (especialmente educación infantil y TDAH).

Para ampliar estos lineamientos, consultar:
- AGENTS.md — reglas de diseño, stack, convenciones y restricciones.
- WORK_PLAN.md — plan modular, fases pendientes y flujo de trabajo con el usuario.
- ARCHITECTURE.md — arquitectura en capas, flujos de sesión y persistencia.
- README_CSS.md — sistema de temas, variables CSS y reglas de diseño visual.

## Principios de UI/UX educativo

- Diseñar para niños con lentes y/o TDAH: sin presión, sin competencia, sin cronómetros regresivos, sin penalizaciones por error.
- Feedback inmediato solo al acertar: sonido + pop + onda radial.
- Contraste mínimo 4.5:1, tamaños legibles, fondos desaturados.
- Tono neutral y cálido, sin mensajes condescendientes.
- Interacciones silenciosas en errores: un clic erróneo no hace nada.
- Ante dudas de diseño: "¿Esto ayuda a un niño con TDAH a practicar lectura sin frustrarse, con feedback inmediato al acertar?" Si sí, va. Si no, se descarta.

## Stack y convenciones de programación

- Exclusivamente JavaScript, CSS y HTML.
- Sin frameworks, sin bundlers, sin compilación, sin npm, sin import/export.
- Todo el código es global; los módulos se registran con `registerModule(def)`.
- Variables globales con `var` en nivel superior; `let` dentro de funciones.
- Funciones de máximo 40 líneas; archivos de 50 a 250 líneas.
- Nombres técnicos en inglés; dominio y UI en español neutro.
- Comentarios en español neutro, solo donde aporten.
- Sin `alert()` salvo emergencia.
- No romper las claves de `localStorage` existentes.

## Reglas de navegación y UI

- Usar `goBack()` como único botón de retroceso general; no crear variantes por categoría o módulo.
- Usar siempre el componente de tarjeta BEM predefinido `.card` + `.card-container` en biblioteca, categorías y módulos.
- El picker de texto para práctica solo muestra tarjetas de la biblioteca; no hay ingreso manual ni carga de archivos en ese flujo.
- Al cerrar un juego o módulo, llamar a `goBack()` para volver a la pantalla anterior sin fondos vacíos.
- El debug es un FAB flotante copiador, activado por defecto en pruebas y ocultable con `Ctrl+Shift+D` o con la clase `hidden`.

## Auditoría por localhost

Ante cualquier cambio o modificación, invitaré al usuario a auditarlo mediante localhost. Si no está abierto, haré que corra el servicio.

## Cambios realizados en esta sesión

### Flujo de biblioteca
- Biblioteca movida a `js/library/books.js` con tarjetas como componente BEM.
- Categoría `texts` ya no usa pantalla genérica de módulos; tiene su propio layout.
- `openAddBookModal` / `openEditBookModal` ahora abren un modal real de título + contenido.
- Botón **Cargar archivo** en el modal para importar `.txt`/`.md` desde el dispositivo.
- Si el texto contiene `# Título`, se abre un segundo modal para confirmar/editar capítulos.
- Al guardar, siempre se vuelve a la biblioteca; la lectura solo inicia al tocar la tarjeta.
- FAB flotante `+` para agregar textos desde la biblioteca.

### Tarjetas de texto
- Creado componente genérico en `styles/components/cards.css`.
- Layout BEM: `.card-container` + `.card` + `.card__thumbnail` + `.card__title` + `.card__description` + `.card__actions`.
- Formato horizontal compacto: icono 42×42 + título + meta + botones siempre visibles.
- Grid con columnas fijas de `180px`, centradas; alto de tarjeta ajustado al contenido.
- Eliminado truncado JS con `-webkit-line-clamp`; ahora se confía en el flujo natural del grid.
- Botones de editar/eliminar fijos en la tarjeta, sin hover.

### CSS modular
- Creado `styles/components/cards.css`.
- Limpiado `styles/library.css` para que solo mantenga header, FAB, capítulos y modal de capítulos.
- Agregado `styles/components/cards.css` en `index.html`.

### Flujo de selección de texto
- Modal de configuración renombrado a "Escoger texto para practicar".
- Eliminado el campo de texto manual, la etiqueta "Texto para practicar:" y el botón de carga de archivo.
- Ahora muestra las tarjetas de la biblioteca para elegir un texto ya guardado.
- Eliminado el botón "Empezar a leer".
- Botón "← Atrás" fijo/flotante en la parte inferior del modal, siempre visible.

### Otros ajustes
- `books.js` limpio: sin `truncateToLines`, sin `requestAnimationFrame`.
- `navigation.js`: `closeCategoryScreen()` ya no vacía `#category-screen`, solo oculta.
- `openModuleScreenWithSkip()` sigue disponible para lectura directa desde biblioteca.
- `persistBook()` siempre vuelve a `renderLibraryScreen()`.

## Estado actual
- Modal de agregar/editar texto: título, contenido, carga de archivo, detección de capítulos.
- Biblioteca: grid de tarjetas compactas con componente BEM, FAB, header estático.
- Categoría `texts` con pantalla dedicada.
- Al elegir un motor de lectura, se abre el picker de textos guardados; no hay campo de texto manual.
- Categorías y módulos usan el mismo componente de tarjeta BEM.
- Navegación centralizada con `goBack()` para categorías, módulos, juegos y lectura.
- Minijuegos: `closeSchulte()` llama a `goBack()`; no queda fondo vacío.
- Debug: botón FAB naranja neón copiador, activado por defecto en pruebas.

## Próximos pasos sugeridos
1. Ajustes finos de tipografía/espaciado del modal según feedback visual.
2. Soportar arrastrar y soltar archivos en el modal.
3. Agregar preview mini del contenido en la tarjeta.
4. Mejorar estados vacíos y accesibilidad.
5. Próximo módulo de juego o lectura pendiente.
