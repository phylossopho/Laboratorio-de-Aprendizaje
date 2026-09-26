// ===== Biblioteca de textos =====
// Cada libro es un texto guardado por el usuario. Se persiste en
// localStorage con la clave lectolab-library.

var LIBRARY_KEY = 'lectolab-library';

function getLibraryFromStorage() {
    try {
        var raw = localStorage.getItem(LIBRARY_KEY);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(function (b) {
            return b && typeof b.id === 'string' && typeof b.content === 'string';
        });
    } catch (e) {
        return [];
    }
}

function saveLibraryToStorage(books) {
    try {
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(books));
        return true;
    } catch (e) {
        return false;
    }
}

function findBook(id) {
    var books = getLibraryFromStorage();
    for (var i = 0; i < books.length; i++) {
        if (books[i].id === id) return books[i];
    }
    return null;
}

function addBook(title, content, category, preferredModule) {
    var books = getLibraryFromStorage();
    var chapters = parseChapters(content);
    var book = {
        id: 'book-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title || 'Sin título',
        content: content || '',
        category: category || 'Personal',
        preferredModule: preferredModule || null,
        createdAt: Date.now(),
        lastOpened: 0,
        chapters: chapters,
        chapterStates: {}
    };
    for (var i = 0; i < chapters.length; i++) {
        book.chapterStates[chapters[i].id] = { completed: false, wpm: null };
    }
    books.push(book);
    saveLibraryToStorage(books);
    return book;
}

function updateBook(id, data) {
    var books = getLibraryFromStorage();
    for (var i = 0; i < books.length; i++) {
        if (books[i].id === id) {
            books[i] = Object.assign({}, books[i], data);
            break;
        }
    }
    saveLibraryToStorage(books);
}

function deleteBook(id) {
    var books = getLibraryFromStorage().filter(function (b) { return b.id !== id; });
    saveLibraryToStorage(books);
}

function markChapterCompleted(bookId, chapterId, wpmUsed) {
    var book = findBook(bookId);
    if (!book) return;
    if (!book.chapterStates) book.chapterStates = {};
    book.chapterStates[chapterId] = {
        completed: true,
        wpm: wpmUsed || null
    };
    updateBook(bookId, { chapterStates: book.chapterStates, lastOpened: Date.now() });
}

function saveChapterWPM(bookId, chapterId, wpmUsed) {
    var book = findBook(bookId);
    if (!book) return;
    if (!book.chapterStates) book.chapterStates = {};
    var prev = book.chapterStates[chapterId] || { completed: false, wpm: null };
    prev.wpm = wpmUsed;
    book.chapterStates[chapterId] = prev;
    updateBook(bookId, { chapterStates: book.chapterStates });
}

// ---------------------------------------------------------------------------
// Apertura de un libro
// ---------------------------------------------------------------------------

function openBook(id) {
    var book = findBook(id);
    if (!book) return;

    updateBook(id, { lastOpened: Date.now() });

    if (!book.chapters || book.chapters.length === 0) {
        // Sin capítulos: leer entero
        var mod = book.preferredModule ? getModule(book.preferredModule) : null;
        if (!mod) mod = getDefaultModuleForCategory('reading');
        if (!mod) return;

        if (inputText) inputText.value = book.content;
        currentBookId = book.id;
        currentChapterId = null;
        openModuleScreenWithSkip(mod.id, false);
        return;
    }

    // Con capítulos: mostrar índice
    showChaptersScreen(book);
}

function openChapter(bookId, chapterId) {
    var book = findBook(bookId);
    if (!book) return;

    var chapter = null;
    for (var i = 0; i < book.chapters.length; i++) {
        if (book.chapters[i].id === chapterId) { chapter = book.chapters[i]; break; }
    }
    if (!chapter) return;

    var state = (book.chapterStates && book.chapterStates[chapterId]) || {};
    var mod = book.preferredModule ? getModule(book.preferredModule) : null;
    if (!mod) mod = getDefaultModuleForCategory('reading');
    if (!mod) return;

    // Aplicar WPM recordado del capítulo si existe
    if (typeof state.wpm === 'number' && modePrefs[mod.id]) {
        wpm = state.wpm;
        if (wpmSlider) wpmSlider.value = wpm;
        if (wpmDisplay) wpmDisplay.textContent = wpm;
    }

    var chapterContent = getChapterContent(book.content, chapter);
    if (inputText) inputText.value = chapterContent;

    currentBookId = book.id;
    currentChapterId = chapterId;
    openModuleScreenWithSkip(mod.id, false);
}

// ---------------------------------------------------------------------------
// Pantalla de índice de capítulos
// ---------------------------------------------------------------------------

function showChaptersScreen(book) {
    var screen = document.getElementById('category-screen');
    if (!screen) return;

    screen.classList.remove('hidden');
    screen.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'category-header';

    var backBtn = document.createElement('button');
    backBtn.className = 'btn btn-secondary category-back';
    backBtn.textContent = '← Biblioteca';
    backBtn.addEventListener('click', function () { renderLibraryScreen(); });

    var title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = book.title;

    header.appendChild(backBtn);
    header.appendChild(title);
    screen.appendChild(header);

    var intro = document.createElement('p');
    intro.className = 'chapters-intro';
    intro.textContent = 'Elige un capítulo para leer. Cada capítulo empieza desde el principio para no perder el hilo.';
    screen.appendChild(intro);

    var list = document.createElement('div');
    list.className = 'chapters-list';

    book.chapters.forEach(function (ch) {
        var state = (book.chapterStates && book.chapterStates[ch.id]) || {};
        list.appendChild(buildChapterItem(book.id, ch, state));
    });

    screen.appendChild(list);
}

function buildChapterItem(bookId, chapter, state) {
    var item = document.createElement('button');
    item.className = 'chapter-item';
    item.type = 'button';

    var status = document.createElement('span');
    status.className = 'chapter-status';
    if (state.completed) {
        status.classList.add('chapter-status-done');
        status.textContent = '✓';
    } else {
        status.textContent = '○';
    }

    var info = document.createElement('div');
    info.className = 'chapter-info';

    var title = document.createElement('div');
    title.className = 'chapter-title';
    title.textContent = chapter.title;

    var meta = document.createElement('div');
    meta.className = 'chapter-meta';
    if (state.wpm) {
        meta.textContent = state.wpm + ' WPM';
    } else {
        meta.textContent = 'Sin leer todavía';
    }

    info.appendChild(title);
    info.appendChild(meta);

    item.appendChild(status);
    item.appendChild(info);

    item.addEventListener('click', function () {
        openChapter(bookId, chapter.id);
    });

    return item;
}

// ---------------------------------------------------------------------------
// Pantalla de la biblioteca
// ---------------------------------------------------------------------------

function renderLibraryScreen() {
    ensureLibraryStructure();
    var screen = document.getElementById('category-screen');
    if (!screen) return;

    screen.classList.remove('hidden');

    var grid = document.getElementById('library-grid');
    if (grid) grid.innerHTML = '';

    var books = getLibraryFromStorage();

    if (books.length === 0) {
        var empty = document.createElement('p');
        empty.className = 'category-empty';
        empty.textContent = 'Todavía no has añadido textos. Pulsa el botón + para empezar.';
        if (grid) grid.appendChild(empty);
        return;
    }

    if (!grid) return;

    books.sort(function (a, b) {
        return (b.lastOpened || b.createdAt) - (a.lastOpened || b.createdAt);
    });

    books.forEach(function (book) {
        grid.appendChild(buildBookCard(book));
    });
}


function ensureLibraryStructure() {
    var screen = document.getElementById('category-screen');
    if (!screen) return;

    var hasHeader = !!document.getElementById('library-header');
    var hasGrid = !!document.getElementById('library-grid');
    var hasFab = !!document.getElementById('fab-add');

    if (hasHeader && hasGrid && hasFab) return;

    screen.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'library-header';
    header.id = 'library-header';

    var backBtn = document.createElement('button');
    backBtn.className = 'btn btn-secondary category-back';
    backBtn.textContent = '← Biblioteca';
    backBtn.addEventListener('click', function () { backToHome(); });

    var title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = 'Textos';

    header.appendChild(backBtn);
    header.appendChild(title);
    screen.appendChild(header);

    var grid = document.createElement('div');
    grid.className = 'card-container';
    grid.id = 'library-grid';
    screen.appendChild(grid);

    var fab = document.createElement('button');
    fab.className = 'fab';
    fab.id = 'fab-add';
    fab.setAttribute('aria-label', 'Añadir texto');
    fab.title = 'Añadir texto';
    fab.textContent = '+';
    fab.addEventListener('click', function () { openAddBookModal(); });
    screen.appendChild(fab);
}

function buildBookCard(book, extraHandlers) {
    extraHandlers = extraHandlers || {};
    var card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    var cover = document.createElement('div');
    cover.className = 'card__thumbnail';

    var hasChapters = book.chapters && book.chapters.length > 0;
    var coverData = hasChapters
        ? { background: 'var(--bg-secondary)', color: 'var(--text-primary)', pattern: 'solid', initial: '📖', hue: 0 }
        : generateCover(book.title, currentTheme);
    if (!hasChapters) {
        coverData.initial = '📄';
    }
    applyCoverStyles(cover, coverData);

    var initial = document.createElement('span');
    initial.className = 'card__thumbnail-initial';
    initial.textContent = coverData.initial;
    cover.appendChild(initial);

    var title = document.createElement('header');
    title.className = 'card__title';
    var h = document.createElement('h3');
    h.textContent = book.title;
    title.appendChild(h);

    var meta = document.createElement('div');
    meta.className = 'card__description';
    if (hasChapters) {
        var completed = 0;
        for (var cid in book.chapterStates) {
            if (book.chapterStates[cid].completed) completed++;
        }
        meta.textContent = completed + ' de ' + book.chapters.length + ' capítulos';
    } else if (book.category && book.category !== 'Personal') {
        meta.textContent = book.category;
    } else {
        meta.textContent = '';
    }

    card.appendChild(cover);
    card.appendChild(title);
    card.appendChild(meta);

    card.addEventListener('click', function () {
        if (typeof extraHandlers.onClick === 'function') {
            extraHandlers.onClick(book);
        } else {
            openTextViewer(book.id);
        }
    });

    return card;
}

// ---------------------------------------------------------------------------
// Visor de texto completo
// ---------------------------------------------------------------------------

var currentViewerBookId = null;
var viewerFontSize = 18;

function openTextViewer(bookId) {
    var book = findBook(bookId);
    if (!book) return;

    currentViewerBookId = bookId;

    var screen = document.getElementById('text-viewer-screen');
    var titleEl = document.getElementById('text-viewer-title');
    var contentEl = document.getElementById('text-viewer-content');
    var controls = document.getElementById('text-viewer-controls');
    var fontSizeDisplay = document.getElementById('text-viewer-font-size-display');

    if (!screen || !titleEl || !contentEl) return;

    titleEl.textContent = book.title || 'Texto';
    contentEl.textContent = book.content || '';
    viewerFontSize = 18;
    if (fontSizeDisplay) fontSizeDisplay.textContent = String(viewerFontSize);
    contentEl.style.fontSize = viewerFontSize + 'px';

    screen.classList.remove('hidden');
    if (controls) controls.classList.remove('hidden');
}

function closeTextViewer() {
    var screen = document.getElementById('text-viewer-screen');
    var controls = document.getElementById('text-viewer-controls');
    if (screen) screen.classList.add('hidden');
    if (controls) controls.classList.add('hidden');
    currentViewerBookId = null;
}

function editCurrentBook() {
    var bookId = currentViewerBookId;
    if (!bookId) return;
    closeTextViewer();
    openTextEditor(bookId);
}

function deleteCurrentBook() {
    if (!currentViewerBookId) return;
    var book = findBook(currentViewerBookId);
    if (!book) return;
    showDeleteConfirm(currentViewerBookId, book.title);
}

function adjustTextViewerFontSize(delta) {
    var sizes = [15, 18, 21, 24, 27];
    var idx = sizes.indexOf(viewerFontSize);
    if (idx === -1) idx = 1;
    var next = idx + delta;
    next = Math.max(0, Math.min(sizes.length - 1, next));
    viewerFontSize = sizes[next];

    var contentEl = document.getElementById('text-viewer-content');
    var fontSizeDisplay = document.getElementById('text-viewer-font-size-display');
    if (contentEl) contentEl.style.fontSize = viewerFontSize + 'px';
    if (fontSizeDisplay) fontSizeDisplay.textContent = String(viewerFontSize);
}

// ---------------------------------------------------------------------------
// Modales de añadir / editar
// ---------------------------------------------------------------------------

var pendingBookContent = null;
var pendingBookChapters = [];
var editingBookId = null;

function openAddBookModal() {
    editingBookId = null;
    pendingBookContent = null;
    pendingBookChapters = [];
    
    var modal = document.getElementById('book-modal');
    var titleInput = document.getElementById('book-title-input');
    var contentInput = document.getElementById('book-content-input');
    var modalTitle = document.getElementById('book-modal-title');
    
    if (!modal || !titleInput || !contentInput) return;
    
    modalTitle.textContent = 'Agregar texto';
    titleInput.value = '';
    contentInput.value = '';
    modal.classList.remove('hidden');
    titleInput.focus();
}

function openEditBookModal(id) {
    openTextEditor(id);
}

function closeBookModal() {
    var modal = document.getElementById('book-modal');
    if (modal) modal.classList.add('hidden');
    editingBookId = null;
    pendingBookContent = null;
    pendingBookChapters = [];
}

function saveBookFromModal() {
    var titleInput = document.getElementById('book-title-input');
    var contentInput = document.getElementById('book-content-input');
    var modal = document.getElementById('book-modal');
    
    if (!titleInput || !contentInput || !modal) return;
    
    var title = titleInput.value.trim();
    var content = contentInput.value;
    
    if (!title) {
        titleInput.focus();
        return;
    }
    
    if (!content || !content.trim()) {
        contentInput.focus();
        return;
    }
    
    pendingBookContent = content;
    var chapters = parseChapters(content);
    
    if (chapters.length > 0) {
        // Mostrar modal de confirmación de capítulos
        pendingBookChapters = chapters.map(function(ch) {
            return { id: ch.id, title: ch.title };
        });
        showChaptersModal(pendingBookChapters);
    } else {
        // Guardar directamente sin capítulos
        persistBook(title, content, []);
    }
}

function showChaptersModal(chapters) {
    var modal = document.getElementById('chapters-modal');
    var container = document.getElementById('chapters-list-container');
    
    if (!modal || !container) return;
    
    container.innerHTML = '';
    
    var list = document.createElement('div');
    list.className = 'chapters-modal-list';
    
    chapters.forEach(function(ch, index) {
        var item = document.createElement('div');
        item.className = 'chapter-modal-item';
        
        var input = document.createElement('input');
        input.type = 'text';
        input.value = ch.title;
        input.dataset.chapterId = ch.id;
        input.dataset.chapterIndex = String(index);
        
        var removeBtn = document.createElement('button');
        removeBtn.className = 'chapter-modal-remove';
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        removeBtn.setAttribute('aria-label', 'Eliminar capítulo');
        removeBtn.addEventListener('click', function() {
            item.remove();
            var remaining = list.querySelectorAll('.chapter-modal-item');
            if (remaining.length === 0) {
                pendingBookChapters = [];
            }
        });
        
        item.appendChild(input);
        item.appendChild(removeBtn);
        list.appendChild(item);
    });
    
    container.appendChild(list);
    modal.classList.remove('hidden');
}

function closeChaptersModal() {
    var modal = document.getElementById('chapters-modal');
    if (modal) modal.classList.add('hidden');
}

function confirmChaptersAndSave() {
    var container = document.getElementById('chapters-list-container');
    var modal = document.getElementById('chapters-modal');
    
    if (!container || !modal) return;
    
    var inputs = container.querySelectorAll('.chapter-modal-item input[type="text"]');
    var chapters = [];
    
    inputs.forEach(function(input) {
        var title = input.value.trim();
        if (title) {
            chapters.push({
                id: input.dataset.chapterId,
                title: title
            });
        }
    });
    
    pendingBookChapters = chapters;
    
    var titleInput = document.getElementById('book-title-input');
    var contentInput = document.getElementById('book-content-input');
    var title = titleInput ? titleInput.value.trim() : '';
    var content = pendingBookContent || (contentInput ? contentInput.value : '');
    
    if (!title) {
        var bookModal = document.getElementById('book-modal');
        if (bookModal) bookModal.classList.remove('hidden');
        if (titleInput) titleInput.focus();
        return;
    }
    
    persistBook(title, content, chapters);
}

function persistBook(title, content, chapters) {
    var book;
    
    if (editingBookId) {
        book = findBook(editingBookId);
        if (!book) return;
        
        var chapterStates = book.chapterStates || {};
        chapters.forEach(function(ch) {
            if (!chapterStates[ch.id]) {
                chapterStates[ch.id] = { completed: false, wpm: null };
            }
        });
        
        updateBook(editingBookId, {
            title: title,
            content: content,
            chapters: chapters,
            chapterStates: chapterStates
        });
        book = findBook(editingBookId);
    } else {
        book = addBook(title, content, 'Personal', null);
    }
    
    // Cerrar modales
    closeBookModal();
    closeChaptersModal();
    
    // Limpiar estado
    editingBookId = null;
    pendingBookContent = null;
    pendingBookChapters = [];
    
    // Volver a la biblioteca
    renderLibraryScreen();
}

function loadBookFileText(event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        var contentInput = document.getElementById('book-content-input');
        if (contentInput) contentInput.value = e.target.result || '';
        event.target.value = '';
    };
    reader.readAsText(file);
}

// ---------------------------------------------------------------------------
// Confirmación de eliminación con diseño de la app
// ---------------------------------------------------------------------------

var pendingDeleteBookId = null;

function showDeleteConfirm(bookId, bookTitle) {
    var modal = document.getElementById('delete-confirm-modal');
    var message = document.getElementById('delete-confirm-message');
    var okBtn = document.getElementById('delete-confirm-ok');
    var cancelBtn = document.getElementById('delete-confirm-cancel');

    if (!modal || !message || !okBtn || !cancelBtn) return;

    pendingDeleteBookId = bookId;
    message.textContent = '¿Eliminar el texto "' + bookTitle + '"?';

    modal.classList.remove('hidden');

    function closeAndClean() {
        modal.classList.add('hidden');
        pendingDeleteBookId = null;
    }

    cancelBtn.onclick = closeAndClean;

    okBtn.onclick = function () {
        if (pendingDeleteBookId) {
            deleteBook(pendingDeleteBookId);
            renderLibraryScreen();
        }
        closeAndClean();
    };
}

// ---------------------------------------------------------------------------
// Editor de texto completo
// ---------------------------------------------------------------------------

var currentEditorBookId = null;

function openTextEditor(bookId) {
    var book = findBook(bookId);
    if (!book) return;

    currentEditorBookId = bookId;

    var screen = document.getElementById('text-editor-screen');
    var titleInput = document.getElementById('text-editor-title-input');
    var contentInput = document.getElementById('text-editor-content-input');
    var controls = document.getElementById('text-editor-controls');
    var titleEl = document.getElementById('text-editor-title');

    if (!screen || !titleInput || !contentInput) return;

    if (titleEl) titleEl.textContent = 'Editar: ' + (book.title || '');
    titleInput.value = book.title || '';
    contentInput.value = book.content || '';

    screen.classList.remove('hidden');
    if (controls) controls.classList.remove('hidden');
    titleInput.focus();
}

function closeTextEditor() {
    var screen = document.getElementById('text-editor-screen');
    var controls = document.getElementById('text-editor-controls');
    if (screen) screen.classList.add('hidden');
    if (controls) controls.classList.add('hidden');
    currentEditorBookId = null;
}

function saveCurrentBook() {
    if (!currentEditorBookId) return;

    var titleInput = document.getElementById('text-editor-title-input');
    var contentInput = document.getElementById('text-editor-content-input');

    if (!titleInput || !contentInput) return;

    var title = titleInput.value.trim();
    var content = contentInput.value;

    if (!title) {
        titleInput.focus();
        return;
    }

    if (!content || !content.trim()) {
        contentInput.focus();
        return;
    }

    updateBook(currentEditorBookId, {
        title: title,
        content: content
    });

    closeTextEditor();
    openTextViewer(currentEditorBookId);
}

function toggleHelp() {
    var modal = document.getElementById('help-modal');
    if (modal) modal.classList.toggle('hidden');
}

function openHelpModal() {
    var modal = document.getElementById('help-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeHelpModal() {
    var modal = document.getElementById('help-modal');
    if (modal) modal.classList.add('hidden');
}
