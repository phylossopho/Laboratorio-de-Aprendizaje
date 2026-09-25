// ===== Bootstrap de la aplicación =====
// Arranca todo. Se ejecuta al cargar el documento.

function init() {
    cacheDOM();
    initDebug();
    loadCustomThemesFromStorage();
    loadPreferences();
    initGameSound();
    loadUserModulesFromStorage();
    bindThemeFileInput();
    bindThemeDropZone();
    bindGlobalEvents();
    bindControls();
    showHome();
}

function bindGlobalEvents() {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', resetControlsFade, true);
    document.addEventListener('pointerdown', resetControlsFade, true);
}

function bindControls() {
    if (!controlsEl) return;
    ['pointerenter', 'pointermove', 'pointerdown'].forEach(function (ev) {
        controlsEl.addEventListener(ev, resetControlsFade);
    });
    controlsEl.addEventListener('pointerleave', startControlsFade);
}

function handleKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (!isRunning) return;

    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
        e.preventDefault();
        if (isPaused) togglePause();
        else advanceNext();
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (!isPaused) advancePrevious();
    } else if (e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
    } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        e.preventDefault();
        adjustWPM(20);
    } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        adjustWPM(-20);
    }
}

document.addEventListener('DOMContentLoaded', init);