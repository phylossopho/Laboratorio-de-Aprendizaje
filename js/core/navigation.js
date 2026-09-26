// ===== Navegación entre pantallas =====

function showHome() {
    debugLog('nav', 'showHome');
    if (homeScreen) homeScreen.classList.remove('hidden');
    if (mainArea) mainArea.classList.add('hidden');
    if (controlsEl) controlsEl.classList.add('hidden');
    currentCategoryId = null;
    currentModuleId = null;
    renderCategoriesGrid();
}

function hideHome() {
    if (homeScreen) homeScreen.classList.add('hidden');
}

function pushNavigation(screen, data) {
    navigationHistory.push({ screen: screen, data: data || {} });
}

function goBack() {
    if (currentModuleId) {
        closeModuleScreen();
        if (typeof unmountGameControls === 'function') unmountGameControls();
        hideGameControlsDOM();
        if (currentCategoryId) {
            openCategoryScreen(currentCategoryId);
        } else {
            showHome();
        }
        return;
    }

    if (currentCategoryId) {
        currentCategoryId = null;
        closeCategoryScreen();
        showHome();
        return;
    }

    showHome();
}

function mountGameControls(gameId) {
    var controls = document.getElementById('game-controls');
    if (controls) controls.classList.remove('hidden');
}

function unmountGameControls() {
    var controls = document.getElementById('game-controls');
    if (controls) controls.classList.add('hidden');
}

// ---------------------------------------------------------------------------
// Home: grid de categorías
// ---------------------------------------------------------------------------

function renderCategoriesGrid() {
    var grid = document.getElementById('categories-grid');
    if (!grid) return;
    grid.innerHTML = '';

    getAllCategories().forEach(function (cat) {
        grid.appendChild(buildCategoryCard(cat));
    });
}

function buildCategoryCard(cat) {
    var btn = document.createElement('button');
    btn.className = 'home-card';
    btn.type = 'button';
    btn.dataset.category = cat.id;
    btn.addEventListener('click', function () { cat.open(); });

    var icon = document.createElement('div');
    icon.className = 'home-card-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = cat.icon;

    var name = document.createElement('div');
    name.className = 'home-card-name';
    name.textContent = cat.name;

    var desc = document.createElement('div');
    desc.className = 'home-card-desc';
    desc.textContent = cat.description;

    var count = document.createElement('div');
    count.className = 'home-card-when';
    count.textContent = categoryCounterLabel(cat.id);

    btn.appendChild(icon);
    btn.appendChild(name);
    btn.appendChild(desc);
    btn.appendChild(count);
    return btn;
}

function categoryCounterLabel(catId) {
    if (catId === 'texts') {
        var books = typeof getLibraryFromStorage === 'function' ? getLibraryFromStorage() : [];
        return books.length + ' texto' + (books.length === 1 ? '' : 's');
    }
    var modules = getModulesByCategory(catId);
    return modules.length + ' herramienta' + (modules.length === 1 ? '' : 's');
}

// ---------------------------------------------------------------------------
// Pantalla de categoría: grid de módulos
// ---------------------------------------------------------------------------

function openCategoryScreen(categoryId) {
    debugLog('nav', 'openCategoryScreen', { id: categoryId });
    currentCategoryId = categoryId;
    hideHome();
    closeAllModals();
    closeModuleScreen();

    var cat = getCategory(categoryId);
    if (!cat) return;

    if (categoryId === 'texts') {
        if (typeof renderLibraryScreen === 'function') renderLibraryScreen();
        return;
    }

    showModulesScreen(cat);
}

function showModulesScreen(cat) {
    var screen = document.getElementById('category-screen');
    if (!screen) return;

    screen.classList.remove('hidden');
    screen.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'category-header';

    var backBtn = document.createElement('button');
    backBtn.className = 'btn btn-secondary category-back';
    backBtn.textContent = '← Volver';
    backBtn.addEventListener('click', goBack);

    var title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = cat.name;

    header.appendChild(backBtn);
    header.appendChild(title);
    screen.appendChild(header);

    var modules = getModulesByCategory(cat.id);
    if (modules.length === 0) {
        var empty = document.createElement('p');
        empty.className = 'category-empty';
        empty.textContent = 'No hay herramientas disponibles en esta categoría.';
        screen.appendChild(empty);
        return;
    }

    var grid = document.createElement('div');
    grid.className = 'card-container';

    modules.forEach(function (mod) {
        grid.appendChild(buildModuleCard(mod));
    });

    screen.appendChild(grid);

    if (cat.id === 'reading') {
        var addBtn = document.createElement('button');
        addBtn.className = 'btn btn-secondary category-add';
        addBtn.textContent = '+ Importar módulo';
        addBtn.addEventListener('click', openModuleImporter);
        screen.appendChild(addBtn);
    }
}

function buildModuleCard(mod) {
    var card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    var cover = document.createElement('div');
    cover.className = 'card__thumbnail';
    var coverData = generateCover(mod.name, currentTheme);
    applyCoverStyles(cover, coverData);

    var icon = document.createElement('span');
    icon.className = 'card__thumbnail-initial';
    icon.textContent = mod.icon;
    cover.appendChild(icon);

    var title = document.createElement('header');
    title.className = 'card__title';
    var h = document.createElement('h3');
    h.textContent = mod.name;
    title.appendChild(h);

    var desc = document.createElement('div');
    desc.className = 'card__description';
    desc.textContent = mod.description || '';

    var actions = document.createElement('div');
    actions.className = 'card__actions';

    card.appendChild(cover);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(actions);

    card.addEventListener('click', function () {
        if (mod.category === 'reading') {
            openTextConfigForModule(mod.id);
        } else {
            openModuleScreen(mod.id);
        }
    });

    return card;
}

// ---------------------------------------------------------------------------
// Pantalla de módulo
// ---------------------------------------------------------------------------

function openModuleScreen(moduleId) {
    var mod = getModule(moduleId);
    if (!mod) return;

    if (mod.category === 'games') {
        mountGameModule(mod);
        return;
    }

    if (mod.category === 'reading') {
        var text = getInputText();
        if (!text || !text.trim()) {
            openTextConfigForModule(mod.id);
            return;
        }
        mountReadingModule(mod, text, false);
        return;
    }

    mountCustomModule(mod);
}

function openModuleScreenWithSkip(moduleId, skipCountdown) {
    var mod = getModule(moduleId);
    if (!mod) return;

    if (mod.category === 'reading') {
        var text = getInputText();
        if (!text || !text.trim()) {
            openTextConfigForModule(mod.id);
            return;
        }
        mountReadingModule(mod, text, !!skipCountdown);
        return;
    }

    if (mod.category === 'games') {
        mountGameModule(mod);
        return;
    }

    mountCustomModule(mod);
}

function closeModuleScreen() {
    if (mainArea) mainArea.classList.add('hidden');
    if (controlsEl) controlsEl.classList.add('hidden');

    // Limpiar el wordDisplay pero NO vaciar el moduleContainer,
    // para no eliminar del DOM el propio wordDisplay.
    if (wordDisplay) {
        wordDisplay.className = 'word-display';
        wordDisplay.innerHTML = '';
        wordDisplay.style.opacity = '';
        wordDisplay.style.transition = '';
        wordDisplay.style.animation = '';
        wordDisplay.style.transform = '';
        wordDisplay.style.width = '';
        wordDisplay.style.height = '';
        wordDisplay.style.background = '';
        wordDisplay.style.padding = '';
        wordDisplay.style.position = '';
        wordDisplay.style.inset = '';
    }

    if (lineTimerBar) lineTimerBar.style.display = 'none';
    if (pauseIndicator) pauseIndicator.classList.add('hidden');

    document.body.classList.remove('galactic-bg');

    // Cerrar overlays de juegos y limpiar la pantalla de juego
    var gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.classList.add('hidden');
        gameScreen.innerHTML = '';
    }

    currentModuleId = null;
}

function closeCategoryScreen() {
    var screen = document.getElementById('category-screen');
    if (screen) {
        screen.classList.add('hidden');
        // No vaciar innerHTML aquí; cada pantalla limpia lo suyo
    }
}

function backToHome() {
    closeAllModals();
    closeCategoryScreen();
    closeModuleScreen();
    showHome();
}

// ---------------------------------------------------------------------------
// Montaje de módulos
// ---------------------------------------------------------------------------

function mountReadingModule(mod, text, skipCountdown) {
    debugLog('reading', 'mountReadingModule', { module: mod.id, chars: (text || '').length, wpm: wpm, chunkSize: chunkSize, skipCountdown: !!skipCountdown });
    currentModuleId = mod.id;
    mode = mod.id;

    applyModePrefs(mod.id);
    updateChunkSizeUI();

    loadText(text);
    currentIndex = 0;
    currentChunk = 0;
    currentSentence = 0;

    closeAllModals();
    closeCategoryScreen();
    hideHome();

    if (mainArea) mainArea.classList.add('hidden');
    if (controlsEl) controlsEl.classList.add('hidden');

    if (wordDisplay) {
        wordDisplay.style.transition = 'none';
        wordDisplay.style.opacity = '0';
    }

    var ctx = buildContext(mod, text, skipCountdown);
    mod.render(ctx);

    isRunning = true;
    isPaused = false;

    if (skipCountdown) {
        if (wordDisplay) {
            wordDisplay.style.transition = 'opacity 0.5s ease';
            wordDisplay.style.opacity = '1';
            wordDisplay.style.animation = '';
        }
        if (mainArea) mainArea.classList.remove('hidden');
        if (controlsEl) controlsEl.classList.remove('hidden');
        if (btnPause) btnPause.disabled = false;
        if (pauseIconEl) pauseIconEl.textContent = '⏸';
        if (pauseIndicator) pauseIndicator.classList.add('hidden');
        if (lineTimerBar) lineTimerBar.style.display = 'none';
        updateChunkSizeVisibility();

        mod.schedule(ctx);
        startTimer();
        startControlsFade();
    } else {
        startReadingCountdown(function () {
            if (mainArea) mainArea.classList.remove('hidden');
            if (controlsEl) controlsEl.classList.remove('hidden');
            if (btnPause) btnPause.disabled = false;
            if (pauseIconEl) pauseIconEl.textContent = '⏸';
            if (pauseIndicator) pauseIndicator.classList.add('hidden');
            if (lineTimerBar) lineTimerBar.style.display = 'none';
            updateChunkSizeVisibility();

            mod.schedule(ctx);
            startTimer();
            startControlsFade();
        });
    }
}

function mountGameModule(mod) {
    debugLog('game', 'mountGameModule', { module: mod.id });
    currentModuleId = mod.id;
    hideHome();
    closeCategoryScreen();
    closeAllModals();

    if (typeof mountGameControls === 'function') mountGameControls(mod.id);

    var ctx = buildContext(mod, '');
    mod.render(ctx);
}

function mountCustomModule(mod) {
    currentModuleId = mod.id;
    hideHome();
    closeCategoryScreen();
    closeAllModals();

    if (typeof mountGameControls === 'function') mountGameControls(mod.id);

    var ctx = buildContext(mod, '');
    mod.render(ctx);
}

function showGameControlsDOM() {
    var controls = document.getElementById('game-controls');
    if (controls) controls.classList.remove('hidden');
}

function hideGameControlsDOM() {
    var controls = document.getElementById('game-controls');
    if (controls) controls.classList.add('hidden');
}

function buildContext(mod, text, skipCountdown) {
    return {
        container: document.getElementById('module-container') || mainArea,
        text: text || '',
        words: words,
        chunks: chunks,
        sentences: sentences,
        wpm: wpm,
        fontSize: fontSize,
        chunkSize: chunkSize,
        theme: currentTheme,
        module: mod,
        feedback: feedbackFull,
        playSound: playGameSound,
        close: closeModuleScreen,
        skipCountdown: !!skipCountdown
    };
}

// ---------------------------------------------------------------------------
// Importación de módulos externos
// ---------------------------------------------------------------------------

function openModuleImporter() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,text/javascript';
    input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        if (!file) return;
        importUserModuleFromFile(file)
            .then(function (newId) {
                console.log('[modules] Módulo importado:', newId);
                if (currentCategoryId) openCategoryScreen(currentCategoryId);
            })
            .catch(function (err) {
                console.warn('[modules] Error:', err.message);
            });
    });
    input.click();
}