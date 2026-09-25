// ===== Controles de lectura =====
// WPM, tamaño de chunk, y aplicación de preferencias por modo.

function updateWPM() {
    applyWPM(wpmSlider ? parseInt(wpmSlider.value, 10) : wpm);
}

function applyWPM(value) {
    if (isNaN(value)) value = 250;
    wpm = Math.max(50, Math.min(900, value));

    if (modePrefs[mode]) modePrefs[mode].wpm = wpm;

    if (wpmSlider) wpmSlider.value = wpm;
    if (wpmDisplay) wpmDisplay.textContent = wpm;
    if (settingsWpmSlider) settingsWpmSlider.value = wpm;
    if (settingsWpmDisplay) settingsWpmDisplay.textContent = String(wpm);
    scheduleSavePreferences();

    if (!isRunning || isPaused) return;

    var mod = getModule(currentModuleId);
    if (mod && mod.reschedule) {
        mod.reschedule(buildContext(mod, ''));
    }
}

function adjustWPM(delta) {
    applyWPM(wpm + delta);
}

// ---------------------------------------------------------------------------
// Tamaño de bloque
// ---------------------------------------------------------------------------

function updateChunkSizeUI() {
    if (chunkSizeDisplay) chunkSizeDisplay.textContent = String(chunkSize);
}

function adjustChunkSize(delta) {
    applyChunkSize(chunkSize + delta);
}

function applyChunkSize(value) {
    chunkSize = Math.max(3, Math.min(7, value));
    modePrefs.chunk.chunkSize = chunkSize;
    updateChunkSizeUI();
    scheduleSavePreferences();

    if (currentModuleId === 'chunk' && isRunning) {
        var text = getInputText();
        if (text && text.trim()) {
            chunks = splitIntoChunks(text, chunkSize);
            currentChunk = 0;
            if (scheduleTimeout !== null) {
                clearTimeout(scheduleTimeout);
                scheduleTimeout = null;
            }
            if (!isPaused) {
                renderDisplay();
                scheduleNext();
            }
        }
    }
}

function updateChunkSizeVisibility() {
    if (!chunkSizeGroup) return;
    if (currentModuleId === 'chunk') {
        chunkSizeGroup.classList.remove('hidden');
    } else {
        chunkSizeGroup.classList.add('hidden');
    }
}

// ---------------------------------------------------------------------------
// Tamaño de fuente
// ---------------------------------------------------------------------------

function adjustFontSize(delta) {
    applyFontSize(getNextFontSize(fontSize, delta));
}

function getNextFontSize(current, delta) {
    var sizes = ['small', 'medium', 'large'];
    var idx = sizes.indexOf(current);
    if (idx === -1) idx = 1;
    var next = idx + delta;
    next = Math.max(0, Math.min(sizes.length - 1, next));
    return sizes[next];
}

function applyFontSize(size) {
    fontSize = size;
    if (modePrefs[mode]) modePrefs[mode].fontSize = fontSize;
    applyTheme();
    updateFontSizeUI();
    scheduleSavePreferences();

    if (!isRunning || isPaused) return;

    var mod = getModule(currentModuleId);
    if (mod && mod.reschedule) {
        mod.reschedule(buildContext(mod, ''));
    }
}

function updateFontSizeUI() {
    var display = document.getElementById('font-size-display');
    if (!display) return;
    var map = { small: 16, medium: 18, large: 22 };
    display.textContent = String(map[fontSize] || 18);
}

// ---------------------------------------------------------------------------
// Preferencias por modo
// ---------------------------------------------------------------------------

function applyModePrefs(m) {
    if (!modePrefs[m]) return;
    var prefs = modePrefs[m];
    wpm = prefs.wpm;
    fontSize = prefs.fontSize;
    if (m === 'chunk' && typeof prefs.chunkSize === 'number') {
        chunkSize = prefs.chunkSize;
    }

    if (wpmSlider) wpmSlider.value = wpm;
    if (wpmDisplay) wpmDisplay.textContent = wpm;
    if (settingsWpmSlider) settingsWpmSlider.value = wpm;
    if (settingsWpmDisplay) settingsWpmDisplay.textContent = String(wpm);

    updateChunkSizeUI();
    applyTheme();
    applyFontSizeUI();
}

// ---------------------------------------------------------------------------
// Desvanecimiento de la barra de controles
// ---------------------------------------------------------------------------

function startControlsFade() {
    if (!controlsEl) return;
    if (controlsFadeTimer !== null) clearTimeout(controlsFadeTimer);
    controlsFadeTimer = window.setTimeout(function () {
        if (controlsEl) controlsEl.classList.add('faded');
    }, 2000);
}

function resetControlsFade() {
    if (!controlsEl) return;
    controlsEl.classList.remove('faded');
    if (controlsFadeTimer !== null) clearTimeout(controlsFadeTimer);
    controlsFadeTimer = window.setTimeout(function () {
        if (controlsEl) controlsEl.classList.add('faded');
    }, 2000);
}

function quickWPMChange(val) {
    wpm = parseInt(val, 10);
    if (isNaN(wpm)) wpm = 250;
    wpm = Math.max(50, Math.min(900, wpm));
    if (modePrefs[mode]) modePrefs[mode].wpm = wpm;
    if (wpmSlider) wpmSlider.value = wpm;
    if (wpmDisplay) wpmDisplay.textContent = wpm;
    if (settingsWpmDisplay) settingsWpmDisplay.textContent = String(wpm);
    scheduleSavePreferences();
}