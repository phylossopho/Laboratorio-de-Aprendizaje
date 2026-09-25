// ===== Temas =====
// Tres temas core + temas personalizados que el usuario carga desde archivos .css.
// Los temas personalizados se guardan como string en localStorage y se
// inyectan en el <head> como <style>.

var CUSTOM_THEMES_KEY = 'reading-custom-themes';

function applyTheme() {
    var themeClasses = ['theme-dark', 'theme-neon', 'theme-light'];
    customThemesCache.forEach(function (t) { themeClasses.push('theme-' + t.id); });

    var fontClasses = ['font-small', 'font-medium', 'font-large'];

    themeClasses.forEach(function (c) { document.body.classList.remove(c); });
    fontClasses.forEach(function (c) { document.body.classList.remove(c); });

    document.body.classList.add('theme-' + currentTheme);
    document.body.classList.add('font-' + fontSize);
}

function applyThemeUI() {
    document.querySelectorAll('.font-opt[data-theme]').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.theme === currentTheme);
    });
}

function setTheme(theme) {
    currentTheme = theme;
    applyTheme();
    applyThemeUI();
    savePreferences();
}

// ---------------------------------------------------------------------------
// Render de la parrilla de temas
// ---------------------------------------------------------------------------

function renderThemesGrid() {
    var container = document.getElementById('themes-grid');
    if (!container) return;
    container.innerHTML = '';
    CORE_THEMES.forEach(function (theme) {
        container.appendChild(buildThemeButton(theme, false));
    });
    applyThemeUI();
}

function renderCustomThemesGrid() {
    var container = document.getElementById('custom-themes-grid');
    if (!container) return;
    container.innerHTML = '';
    customThemesCache.forEach(function (theme) {
        container.appendChild(buildThemeButton(theme, true));
    });
    applyThemeUI();
}

function buildThemeButton(theme, deletable) {
    var btn = document.createElement('button');
    btn.className = 'font-opt theme-option' + (deletable ? ' custom-theme-card' : '');
    btn.dataset.theme = theme.id;
    btn.type = 'button';
    btn.addEventListener('click', function (e) {
        if (e.target.classList.contains('custom-theme-delete')) return;
        setTheme(theme.id);
    });

    var icon = document.createElement('span');
    icon.className = 'option-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = theme.icon;

    var label = document.createElement('span');
    label.className = 'option-label';
    label.textContent = theme.name;

    btn.appendChild(icon);
    btn.appendChild(label);

    if (deletable) {
        var del = document.createElement('button');
        del.type = 'button';
        del.className = 'custom-theme-delete';
        del.setAttribute('aria-label', 'Eliminar tema ' + theme.name);
        del.title = 'Eliminar tema';
        del.textContent = '×';
        del.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteCustomTheme(theme.id);
        });
        btn.appendChild(del);
    }

    return btn;
}

// ---------------------------------------------------------------------------
// Persistencia de temas personalizados
// ---------------------------------------------------------------------------

function getCustomThemesFromStorage() {
    try {
        var raw = localStorage.getItem(CUSTOM_THEMES_KEY);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(function (t) {
            return t && typeof t.id === 'string'
                && typeof t.name === 'string'
                && typeof t.icon === 'string'
                && typeof t.css === 'string';
        });
    } catch (e) {
        return [];
    }
}

function saveCustomThemesToStorage(themes) {
    try {
        localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
        return true;
    } catch (e) {
        return false;
    }
}

function loadCustomThemesFromStorage() {
    customThemesCache = getCustomThemesFromStorage();
    customThemesCache.forEach(function (theme) {
        injectCustomThemeStyle(theme);
    });
}

function injectCustomThemeStyle(theme) {
    var existing = document.querySelector('style[data-custom-theme="' + theme.id + '"]');
    if (existing) return;
    var style = document.createElement('style');
    style.setAttribute('data-custom-theme', theme.id);
    style.textContent = theme.css;
    document.head.appendChild(style);
}

function removeCustomThemeStyle(id) {
    var el = document.querySelector('style[data-custom-theme="' + id + '"]');
    if (el && el.parentNode) el.parentNode.removeChild(el);
}

// ---------------------------------------------------------------------------
// Parseo de archivos de tema
// ---------------------------------------------------------------------------

function parseThemeFile(fileName, content) {
    if (!content || content.length > 200000) return null;

    var idMatch = content.match(/body\.theme-([a-z0-9][a-z0-9-]*)/i);
    if (!idMatch) return null;
    var id = idMatch[1].toLowerCase();

    var coreIds = CORE_THEMES.map(function (t) { return t.id; });
    if (coreIds.indexOf(id) !== -1) return null;

    var nameMatch = content.match(/@theme-name\s*:\s*([^\n*]+)/i);
    var name = nameMatch
        ? nameMatch[1].trim()
        : fileName.replace(/\.css$/i, '').replace(/[-_]+/g, ' ');

    var iconMatch = content.match(/@theme-icon\s*:\s*([^\n*]+)/i);
    var icon = iconMatch ? iconMatch[1].trim() : '◆';

    if (!name) name = id;

    return { id: id, name: name, icon: icon, css: content };
}

function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(String(reader.result || '')); };
        reader.onerror = function () { reject(reader.error); };
        reader.readAsText(file);
    });
}

// ---------------------------------------------------------------------------
// Importación de temas
// ---------------------------------------------------------------------------

function openThemeFolderPicker() {
    var input = document.getElementById('theme-folder-input');
    if (input) input.click();
}

function bindThemeFileInput() {
    var input = document.getElementById('theme-folder-input');
    if (!input) return;
    input.addEventListener('change', handleThemeFilesSelected);
}

function bindThemeDropZone() {
    var zone = document.getElementById('custom-themes-drop');
    if (!zone) return;

    ['dragenter', 'dragover'].forEach(function (ev) {
        zone.addEventListener(ev, function (e) {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(function (ev) {
        zone.addEventListener(ev, function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (ev === 'dragleave' && zone.contains(e.target)) return;
            zone.classList.remove('drag-over');
        });
    });

    zone.addEventListener('drop', handleThemeDrop);
}

async function handleThemeFilesSelected(event) {
    var input = event.target;
    if (!input.files || input.files.length === 0) return;
    await processThemeFiles(Array.prototype.slice.call(input.files));
    input.value = '';
}

async function handleThemeDrop(event) {
    if (!event.dataTransfer) return;
    var files = Array.prototype.slice.call(event.dataTransfer.files);
    await processThemeFiles(files);
}

async function processThemeFiles(files) {
    var cssFiles = files.filter(function (f) { return /\.css$/i.test(f.name); });
    if (cssFiles.length === 0) {
        showCustomThemesToast('No se encontraron archivos .css.');
        return;
    }

    var added = 0, updated = 0, skipped = 0;

    for (var i = 0; i < cssFiles.length; i++) {
        try {
            var content = await readFileAsText(cssFiles[i]);
            var parsed = parseThemeFile(cssFiles[i].name, content);
            if (!parsed) { skipped++; continue; }

            var idx = -1;
            for (var j = 0; j < customThemesCache.length; j++) {
                if (customThemesCache[j].id === parsed.id) { idx = j; break; }
            }

            if (idx !== -1) {
                removeCustomThemeStyle(parsed.id);
                customThemesCache[idx] = parsed;
                updated++;
            } else {
                customThemesCache.push(parsed);
                added++;
            }

            injectCustomThemeStyle(parsed);
        } catch (e) {
            skipped++;
        }
    }

    var saved = saveCustomThemesToStorage(customThemesCache);
    if (!saved) {
        showCustomThemesToast('Error al guardar. El almacenamiento está lleno.');
    } else {
        var parts = [];
        if (added > 0) parts.push(added + ' añadido' + (added === 1 ? '' : 's'));
        if (updated > 0) parts.push(updated + ' actualizado' + (updated === 1 ? '' : 's'));
        if (skipped > 0) parts.push(skipped + ' omitido' + (skipped === 1 ? '' : 's'));
        showCustomThemesToast(parts.length ? parts.join(', ') + '.' : 'Sin cambios.');
    }

    renderCustomThemesGrid();
    applyTheme();
}

function deleteCustomTheme(id) {
    customThemesCache = customThemesCache.filter(function (t) { return t.id !== id; });
    removeCustomThemeStyle(id);
    saveCustomThemesToStorage(customThemesCache);

    if (currentTheme === id) {
        currentTheme = 'dark';
        applyTheme();
        savePreferences();
    }

    renderCustomThemesGrid();
}

function showCustomThemesToast(message) {
    var section = document.getElementById('custom-themes-grid');
    if (!section || !section.parentNode) return;

    var existing = document.getElementById('custom-themes-toast');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

    var toast = document.createElement('p');
    toast.id = 'custom-themes-toast';
    toast.className = 'custom-themes-toast';
    toast.textContent = message;
    section.parentNode.appendChild(toast);

    window.setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3500);
}