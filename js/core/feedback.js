// ===== Feedback inmediato (TDAH) =====
// Respuesta multimodal al acierto. Todo se dispara con una sola llamada.
// Se apaga si el usuario tiene prefers-reduced-motion activado.

var feedbackReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

function feedbackFull(x, y) {
    feedbackSound();
    feedbackRipple(x, y);
}

function feedbackSound() {
    playGameSound();
}

function feedbackPulse(el) {
    if (!el) return;
    el.classList.remove('feedback-pulse');
    void el.offsetWidth;
    el.classList.add('feedback-pulse');
    window.setTimeout(function () {
        el.classList.remove('feedback-pulse');
    }, 400);
}

function feedbackRipple(x, y) {
    if (feedbackReducedMotion) return;
    if (typeof x !== 'number' || typeof y !== 'number') return;

    var ripple = document.createElement('div');
    ripple.className = 'feedback-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);

    window.setTimeout(function () {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 500);
}

function feedbackLocal(el) {
    if (!el) return;
    el.classList.remove('feedback-flash');
    void el.offsetWidth;
    el.classList.add('feedback-flash');
    window.setTimeout(function () {
        el.classList.remove('feedback-flash');
    }, 400);
}