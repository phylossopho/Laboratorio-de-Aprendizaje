// ===== Preferencias persistentes =====
// Guarda y carga el estado de la app en localStorage.
// Las claves se mantienen compatibles con la versión anterior.

function loadPreferences() {
    try {
        sliderPos = localStorage.getItem('reading-sliderPos') || 'bottom';
        controlSize = localStorage.getItem('reading-controlSize') || 'medium';

        var savedSound = localStorage.getItem('reading-gameSound');
        if (savedSound === 'off' || savedSound === 'soft' || savedSound === 'on') {
            gameSoundMode = savedSound;
        }

        var savedTheme = localStorage.getItem('reading-theme');
        var validIds = CORE_THEMES.map(function (t) { return t.id; });
        customThemesCache.forEach(function (t) { validIds.push(t.id); });
        currentTheme = validIds.indexOf(savedTheme) !== -1 ? savedTheme : 'dark';

        var rawPrefs = localStorage.getItem('reading-mode-prefs');
        if (rawPrefs) {
            var parsed = JSON.parse(rawPrefs);
            ['word', 'chunk', 'line', 'galactic'].forEach(function (m) {
                if (!parsed[m]) return;
                if (typeof parsed[m].wpm === 'number') {
                    modePrefs[m].wpm = Math.max(50, Math.min(900, parsed[m].wpm));
                }
                if (typeof parsed[m].fontSize === 'string') {
                    modePrefs[m].fontSize = parsed[m].fontSize;
                }
                if (typeof parsed[m].chunkSize === 'number') {
                    modePrefs[m].chunkSize = Math.max(3, Math.min(7, parsed[m].chunkSize));
                }
            });
        }

        var savedMode = localStorage.getItem('reading-mode');
        if (savedMode && modePrefs[savedMode]) {
            mode = savedMode;
        }

        // Cargar último texto leído (para reapertura directa)
        var savedLastText = localStorage.getItem('reading-last-text');
        if (savedLastText && savedLastText.trim()) {
            lastText = savedLastText;
            if (inputText) inputText.value = lastText;
        }
    } catch (e) {
        console.warn('[preferences] Error al cargar:', e.message);
    }

    if (modePrefs[mode]) {
        var prefs = modePrefs[mode];
        wpm = prefs.wpm;
        fontSize = prefs.fontSize;
        if (mode === 'chunk' && typeof prefs.chunkSize === 'number') {
            chunkSize = prefs.chunkSize;
        }
    }
}

function savePreferences() {
    debugLog('prefs', 'savePreferences', { mode: mode, wpm: wpm, chunkSize: chunkSize });
    try {
        localStorage.setItem('reading-theme', currentTheme);
        localStorage.setItem('reading-sliderPos', sliderPos);
        localStorage.setItem('reading-controlSize', controlSize);
        localStorage.setItem('reading-mode', mode);
        localStorage.setItem('reading-mode-prefs', JSON.stringify(modePrefs));
        localStorage.setItem('reading-gameSound', gameSoundMode);
    } catch (e) {
        console.warn('[preferences] Error al guardar:', e.message);
    }
}

function showSavedPrefs() {
    try {
        var raw = localStorage.getItem('reading-mode-prefs');
        console.log('mode-prefs:', raw ? JSON.parse(raw) : '(vacío)');
        console.log('estado actual:', {
            mode: mode,
            wpm: wpm,
            fontSize: fontSize,
            chunkSize: chunkSize,
            theme: currentTheme
        });
    } catch (e) {
        console.log('Error leyendo:', e);
    }
}

// Guarda las preferencias con debounce. Se reinicia el timer en cada
// llamada, así que solo se guarda tras 3 segundos sin actividad.
function scheduleSavePreferences() {
    if (savePrefsTimer !== null) {
        clearTimeout(savePrefsTimer);
    }
    savePrefsTimer = window.setTimeout(function () {
        savePrefsTimer = null;
        savePreferences();
    }, 3000);
}