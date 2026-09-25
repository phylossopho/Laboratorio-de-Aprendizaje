// ===== Modales =====
// Apertura, cierre y contenido de los modales de configuración,
// textos y minijuegos.

function closeAllModals() {
    [configModal, textsModal, gamesModal, settingsModal].forEach(function (m) {
        if (m) m.classList.add('hidden');
    });
    var fab = document.getElementById('config-back-fab');
    if (fab) fab.classList.add('hidden');
}

function openSettings() {
    if (settingsModal) settingsModal.classList.remove('hidden');
    renderThemesGrid();
    renderCustomThemesGrid();
    applyFontSizeUI();
    applySliderPos();
    applyControlSize();
    applyGameSoundUI();

    if (settingsWpmSlider) settingsWpmSlider.value = wpm;
    if (settingsWpmDisplay) settingsWpmDisplay.textContent = String(wpm);
}

function closeSettings() {
    if (settingsModal) settingsModal.classList.add('hidden');
}

function openTextsModal() {
    if (textsModal) textsModal.classList.remove('hidden');
    if (typeof renderTextsList === 'function') renderTextsList();
}

function closeTextsModal() {
    if (textsModal) textsModal.classList.add('hidden');
}

function openGamesModal() {
    if (gamesModal) gamesModal.classList.remove('hidden');
    var grid = document.getElementById('games-grid');
    if (grid && typeof renderGamesGrid === 'function') renderGamesGrid(grid);
}

function closeGamesModal() {
    if (gamesModal) gamesModal.classList.add('hidden');
}

// ---------------------------------------------------------------------------
// Configuración de texto para un módulo de lectura
// ---------------------------------------------------------------------------

function openTextConfigForModule(moduleId) {
    currentModuleId = moduleId;
    closeAllModals();
    if (configModal) configModal.classList.remove('hidden');
    renderTextPickerList();
    var fab = document.getElementById('config-back-fab');
    if (fab) fab.classList.remove('hidden');
}

function renderTextPickerList() {
    var container = document.getElementById('text-picker-list');
    if (!container) return;
    container.innerHTML = '';

    var books = getLibraryFromStorage();
    if (books.length === 0) {
        var empty = document.createElement('p');
        empty.className = 'category-empty';
        empty.textContent = 'Todavía no hay textos en la biblioteca.';
        container.appendChild(empty);
        return;
    }

    var grid = document.createElement('div');
    grid.className = 'home-grid';

    books.forEach(function(book) {
        var card = buildBookCard(book, {
            onClick: function() {
                var mod = currentModuleId ? getModule(currentModuleId) : null;
                if (!mod) mod = getDefaultModuleForCategory('reading');
                if (!mod) return;

                lastText = book.content;
                currentBookId = book.id;
                currentChapterId = null;
                openModuleScreenWithSkip(mod.id, true);
            },
            onDelete: function() {
                renderTextPickerList();
            }
        });
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

function backToModulesScreen() {
    closeAllModals();
    if (currentCategoryId) openCategoryScreen(currentCategoryId);
    var fab = document.getElementById('config-back-fab');
    if (fab) fab.classList.add('hidden');
}

function startWithConfig() {
    var text = inputText ? inputText.value : '';
    if (!text || !text.trim()) return;

    var mod = currentModuleId ? getModule(currentModuleId) : null;
    if (!mod) {
        mod = getDefaultModuleForCategory('reading');
    }
    if (!mod) return;

    closeAllModals();
    openModuleScreenWithSkip(mod.id, true);
}

function loadFileText(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
        if (inputText) inputText.value = e.target.result;
        event.target.value = '';
    };
    reader.readAsText(file);
}

// ---------------------------------------------------------------------------
// Pantalla de textos (biblioteca)
// ---------------------------------------------------------------------------

function showTextsScreen() {
    if (typeof renderLibraryScreen === 'function') {
        renderLibraryScreen();
    }
}

// ---------------------------------------------------------------------------
// Aplicar UI de opciones
// ---------------------------------------------------------------------------

function applyFontSizeUI() {
    document.querySelectorAll('.font-opt[data-size]').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.size === fontSize);
    });
}

function applySliderPos() {
    if (document.body) document.body.dataset.sliderPos = sliderPos;
    document.querySelectorAll('.font-opt[data-pos]').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.pos === sliderPos);
    });
}

function applyControlSize() {
    var el = document.querySelector('.controls');
    if (el) {
        el.classList.remove('size-small', 'size-medium', 'size-large');
        el.classList.add('size-' + controlSize);
    }
    document.querySelectorAll('.font-opt[data-csize]').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.csize === controlSize);
    });
}

function setFontSize(size) {
    fontSize = size;
    if (modePrefs[mode]) modePrefs[mode].fontSize = fontSize;
    applyTheme();
    applyFontSizeUI();
    scheduleSavePreferences();
}

function setSliderPos(pos) {
    sliderPos = pos;
    document.body.dataset.sliderPos = pos;
    applySliderPos();
    scheduleSavePreferences();
}

function setControlSize(size) {
    controlSize = size;
    applyControlSize();
    scheduleSavePreferences();
}