// ===== Módulo: Ascenso galáctico =====

var galacticScroller = null;
var galacticContent = null;
var galacticRAF = null;
var galacticStartTime = 0;
var galacticPausedAt = 0;
var galacticTotalPaused = 0;
var galacticSpeed = 0;
var galacticStartY = 0;
var galacticEndY = 0;
var galacticTotalDistance = 0;

function renderGalacticDisplay() {
    if (!words || words.length === 0) return;
    if (!wordDisplay) return;

    wordDisplay.classList.add('galactic-display');
    document.body.classList.add('galactic-bg');
    wordDisplay.innerHTML = '';

    galacticScroller = document.createElement('div');
    galacticScroller.className = 'galactic-scroller';

    galacticContent = document.createElement('div');
    galacticContent.className = 'galactic-content';
    galacticContent.textContent = words.join(' ');

    galacticScroller.appendChild(galacticContent);
    wordDisplay.appendChild(galacticScroller);

    // Empujar el scroller justo debajo del viewport antes de mostrarlo.
    var initialViewport = window.innerHeight;
    galacticScroller.style.transform = 'translateY(' + initialViewport + 'px)';
}

function startGalacticAnimation() {
    if (!galacticScroller || !galacticContent) return;

    var viewportHeight = window.innerHeight;

    void galacticScroller.offsetWidth;
    var scrollerHeight = galacticScroller.offsetHeight || galacticScroller.getBoundingClientRect().height;

    // El scroller (top: 0) arranca con su borde superior justo debajo
    // del viewport, y termina con su borde inferior en el borde superior
    // del viewport. Recorrido total = viewportHeight + scrollerHeight.
    galacticStartY = viewportHeight;
    galacticEndY = -scrollerHeight;
    galacticTotalDistance = galacticStartY - galacticEndY;

    // Velocidad según el WPM del usuario
    var totalWords = words.length || 1;
    var durationSec = (totalWords / wpm) * 60;
    galacticSpeed = galacticTotalDistance / durationSec;

    galacticStartTime = Date.now();
    galacticPausedAt = 0;
    galacticTotalPaused = 0;

    galacticScroller.style.transform = 'translateY(' + galacticStartY + 'px)';

    debugLog('galactic', 'start', {
        distance: Math.round(galacticTotalDistance),
        speed: Math.round(galacticSpeed),
        duration: Math.round(durationSec) + 's'
    });

    galacticRAF = window.requestAnimationFrame(stepGalactic);
}

function stepGalactic() {
    if (!galacticScroller) return;
    if (isPaused) { galacticRAF = null; return; }

    var now = Date.now();
    var elapsed = now - galacticStartTime - galacticTotalPaused;
    var offset = (elapsed / 1000) * galacticSpeed;

    if (offset >= galacticTotalDistance) {
        galacticScroller.style.transform = 'translateY(' + galacticEndY + 'px)';
        debugLog('galactic', 'end');
        galacticRAF = null;
        finishReading();
        return;
    }

    var currentY = galacticStartY - offset;
    galacticScroller.style.transform = 'translateY(' + currentY + 'px)';
    galacticRAF = window.requestAnimationFrame(stepGalactic);
}

function pauseGalactic() {
    if (!galacticScroller) return;
    galacticPausedAt = Date.now();
    if (galacticRAF !== null) {
        window.cancelAnimationFrame(galacticRAF);
        galacticRAF = null;
    }
}

function resumeGalactic() {
    if (!galacticScroller) return;
    if (galacticPausedAt > 0) {
        galacticTotalPaused += Date.now() - galacticPausedAt;
        galacticPausedAt = 0;
    }
    if (galacticRAF === null) {
        galacticRAF = window.requestAnimationFrame(stepGalactic);
    }
}

function updateGalacticWPM() {
    if (!galacticScroller || !galacticContent) return;
    if (isPaused) return;

    var now = Date.now();
    var elapsed = now - galacticStartTime - galacticTotalPaused;
    var oldOffset = (elapsed / 1000) * galacticSpeed;

    var totalWords = words.length || 1;
    var durationSec = (totalWords / wpm) * 60;
    galacticSpeed = galacticTotalDistance / durationSec;

    galacticStartTime = now - (oldOffset / galacticSpeed) * 1000;
}

function clearGalacticPresentation() {
    if (galacticRAF !== null) {
        window.cancelAnimationFrame(galacticRAF);
        galacticRAF = null;
    }
    galacticScroller = null;
    galacticContent = null;
    galacticStartTime = 0;
    galacticPausedAt = 0;
    galacticTotalPaused = 0;
    galacticStartY = 0;
    galacticEndY = 0;
    galacticTotalDistance = 0;
    document.body.classList.remove('galactic-bg');
    if (wordDisplay) wordDisplay.classList.remove('galactic-display');
}

window.addEventListener('resize', function () {
    if (galacticContent && !isPaused) {
        var now = Date.now();
        var elapsed = now - galacticStartTime - galacticTotalPaused;
        var oldOffset = (elapsed / 1000) * galacticSpeed;

        var viewportHeight = window.innerHeight;
        void galacticScroller.offsetWidth;
        var scrollerHeight = galacticScroller.offsetHeight || galacticScroller.getBoundingClientRect().height;

        galacticStartY = viewportHeight;
        galacticEndY = -scrollerHeight;
        galacticTotalDistance = galacticStartY - galacticEndY;

        var totalWords = words.length || 1;
        var durationSec = (totalWords / wpm) * 60;
        galacticSpeed = galacticTotalDistance / durationSec;

        galacticStartTime = now - (oldOffset / galacticSpeed) * 1000;
    }
});

registerModule({
    id: 'galactic',
    category: 'reading',
    name: 'Ascenso galáctico',
    icon: '✦',
    description: 'El texto asciende desde el horizonte con perspectiva. Entrena la lectura continua.',
    hint: 'Para: lectura fluida y sostenida',
    order: 4,
    shell: 'reading',
    render: function () { renderGalacticDisplay(); },
    schedule: function () { startGalacticAnimation(); },
    reschedule: function () { updateGalacticWPM(); },
    pause: function () { pauseGalactic(); },
    resume: function () { resumeGalactic(); },
    stop: function () { clearGalacticPresentation(); }
});