// ===== Portadas generadas =====
// Cada libro tiene una portada única generada a partir del título.
// No se guarda como imagen, se calcula al vuelo.

function hashString(s) {
    var h = 0;
    if (!s) return h;
    for (var i = 0; i < s.length; i++) {
        h = ((h << 5) - h) + s.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}

function pickHue(hash) {
    return hash % 360;
}

function pickPattern(hash) {
    var patterns = ['diagonal', 'dots', 'waves', 'grid', 'solid'];
    return patterns[hash % patterns.length];
}

function generateCover(title, theme) {
    var hash = hashString(title || '');
    var hue = pickHue(hash);
    var pattern = pickPattern(hash);
    var initial = (title || '?').trim().charAt(0).toUpperCase();

    var isLight = theme === 'light' || theme === 'basketball';
    var saturation = isLight ? '45%' : '38%';
    var lightness = isLight ? '72%' : '32%';
    var textLightness = isLight ? '18%' : '92%';

    return {
        background: 'hsl(' + hue + ', ' + saturation + ', ' + lightness + ')',
        color: 'hsl(' + hue + ', 20%, ' + textLightness + ')',
        pattern: pattern,
        initial: initial,
        hue: hue
    };
}

function applyCoverStyles(el, cover) {
    if (!el) return;
    el.style.background = cover.background;
    el.style.color = cover.color;

    el.classList.remove('cover-pattern-diagonal', 'cover-pattern-dots',
                       'cover-pattern-waves', 'cover-pattern-grid',
                       'cover-pattern-solid');
    el.classList.add('cover-pattern-' + cover.pattern);
}