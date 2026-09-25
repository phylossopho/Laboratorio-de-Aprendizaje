# README_CSS.md

Documentacion del sistema de temas.
Theme system documentation.

## Como usar un tema personalizado

Configuracion, Temas personalizados, boton Anadir. O arrastra los
archivos .css al recuadro punteado.

## Estructura del archivo

Un archivo de tema empieza con dos comentarios opcionales:

  /* @theme-name: Mi Tema */
  /* @theme-icon: X */

Y sigue con un bloque CSS:

  body.theme-mi-tema {
      --bg-primary: #1a1a1a;
      --text-primary: #e0e0e0;
  }

El selector body.theme-xxx es obligatorio. El id va en minusculas, sin
acentos ni espacios. No puede ser dark, neon ni light (esos son los
temas core).

## Variables disponibles

Fondos: --bg-primary, --bg-secondary, --bg-tertiary, --bg-card,
--bg-card-hover, --bg-card-active.

Bordes: --border-color, --border-strong, --border-focus.

Texto: --text-primary, --text-secondary, --text-muted.

Acento: --accent-primary, --accent-hover, --accent-text.

Botones primarios: --btn-primary-bg, --btn-primary-text.

Botones secundarios: --btn-secondary-bg, --btn-secondary-text,
--btn-disabled-opacity.

Inputs: --input-bg, --input-border, --input-text.

Modales: --modal-bg, --modal-border, --slider-track, --badge-color.

Pausa: --pause-color, --pause-bg, --settings-btn-hover,
--settings-btn-text.

Muestra: --sample-btn-bg, --sample-btn-border, --sample-btn-text,
--sample-btn-hover-border, --sample-btn-hover-text.

Guardados: --saved-text-bg, --saved-text-border,
--saved-text-hover-bg, --saved-text-hover-border, --saved-text-title,
--saved-text-preview.

Auxiliares: --btn-use-bg, --btn-use-text, --btn-edit-bg,
--btn-edit-text, --btn-delete-bg, --btn-delete-text, --btn-cancel-bg,
--btn-cancel-text, --btn-save-bg, --btn-save-text.

Formularios: --edit-form-input-bg, --edit-form-input-border,
--edit-form-input-text, --edit-form-input-focus.

Galactico: --galactic-text, --galactic-content-bg.

Countdown: --countdown-text, --countdown-shadow.

Lectura: --focal-color, --pointer-color, --context-color,
--chunk-color, --line-color, --reading-halo.

Feedback: --feedback-ripple.

## Reglas de diseno

1. Contraste minimo 4.5:1 entre --text-primary y --bg-primary.
2. Fondos desaturados. La saturacion se reserva para acentos.
3. Coherencia termica: fondo calido, acentos calidos.
4. --accent-text debe contrastar con --accent-primary.
5. Evita blanco y negro puros.

## Prompt para IA

Genera un archivo CSS para un tema personalizado del proyecto
LectoLab.

Reglas:

1. Empieza con dos comentarios: @theme-name y @theme-icon.
2. Un bloque body.theme-[id] con id en minusculas sin acentos.
3. Define todas las variables listadas en este README.
4. Inspiracion: describe el tema.
5. Contraste 4.5:1, fondos desaturados, coherencia termica.
6. Devuelve solo el codigo CSS.

## English

Settings, Custom themes, Add button or drag .css files. The
body.theme-xxx selector is mandatory. The id must be lowercase, no
accents. Cannot be dark, neon or light. Variables: same list as the
Spanish section. Rules: 4.5:1 contrast, desaturated backgrounds,
thermal consistency, no pure white or black.