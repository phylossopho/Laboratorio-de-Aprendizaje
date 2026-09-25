// ===== Sistema de módulos y categorías =====
// Este archivo es la columna vertebral de la app.
// Todo lo demás (motores de lectura, minijuegos, módulos externos)
// se registra aquí.
//
// Un módulo se registra llamando a registerModule(def).
// Una categoría se registra llamando a registerCategory(def).
// Los módulos externos importados por el usuario se guardan como string
// en localStorage y se reinyectan al arrancar.

var MODULES = {};      // mapa: id -> definición del módulo
var CATEGORIES = {};   // mapa: id -> definición de la categoría
var MODULE_ORDER = []; // orden de registro de módulos (para renderizar en orden)

var USER_MODULES_STORAGE_KEY = 'lectolab-user-modules';

// ---------------------------------------------------------------------------
// Registro de categorías
// ---------------------------------------------------------------------------

function registerCategory(def) {
    if (!def || !def.id) {
        console.warn('[modules] registerCategory: falta id');
        return;
    }
    if (CATEGORIES[def.id]) {
        console.warn('[modules] Categoría ya registrada:', def.id);
        return;
    }
    CATEGORIES[def.id] = {
        id: def.id,
        name: def.name || def.id,
        icon: def.icon || '◆',
        description: def.description || '',
        order: typeof def.order === 'number' ? def.order : 999,
        open: def.open || function () {
            console.warn('[modules] Categoría sin handler open:', def.id);
        }
    };
}

function getCategory(id) {
    return CATEGORIES[id] || null;
}

function getAllCategories() {
    var list = [];
    for (var id in CATEGORIES) {
        if (CATEGORIES.hasOwnProperty(id)) list.push(CATEGORIES[id]);
    }
    list.sort(function (a, b) { return a.order - b.order; });
    return list;
}

// ---------------------------------------------------------------------------
// Registro de módulos
// ---------------------------------------------------------------------------

function registerModule(def) {
    if (!def || !def.id) {
        console.warn('[modules] registerModule: falta id');
        return;
    }
    if (!def.category) {
        console.warn('[modules] registerModule: falta category en', def.id);
        return;
    }
    if (MODULES[def.id]) {
        console.warn('[modules] Módulo ya registrado:', def.id);
        return;
    }

    MODULES[def.id] = {
        id: def.id,
        category: def.category,
        name: def.name || def.id,
        icon: def.icon || '◇',
        description: def.description || '',
        hint: def.hint || '',
        order: typeof def.order === 'number' ? def.order : 999,
        shell: def.shell || 'custom',
        external: !!def.external,
        render: def.render || function () {},
        schedule: def.schedule || function () {},
        reschedule: def.reschedule || null,
        stop: def.stop || function () {},
        actions: def.actions || null
    };

    MODULE_ORDER.push(def.id);
}

function unregisterModule(id) {
    if (!MODULES[id]) return;
    delete MODULES[id];
    var idx = MODULE_ORDER.indexOf(id);
    if (idx !== -1) MODULE_ORDER.splice(idx, 1);
}

function getModule(id) {
    return MODULES[id] || null;
}

function getModulesByCategory(categoryId) {
    var list = [];
    for (var i = 0; i < MODULE_ORDER.length; i++) {
        var m = MODULES[MODULE_ORDER[i]];
        if (m && m.category === categoryId) list.push(m);
    }
    list.sort(function (a, b) { return a.order - b.order; });
    return list;
}

function getDefaultModuleForCategory(categoryId) {
    var list = getModulesByCategory(categoryId);
    return list.length > 0 ? list[0] : null;
}

// ---------------------------------------------------------------------------
// Persistencia de módulos de usuario
// ---------------------------------------------------------------------------

function getUserModulesFromStorage() {
    try {
        var raw = localStorage.getItem(USER_MODULES_STORAGE_KEY);
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(function (m) {
            return m && typeof m.id === 'string' && typeof m.code === 'string';
        });
    } catch (e) {
        return [];
    }
}

function saveUserModulesToStorage(list) {
    try {
        localStorage.setItem(USER_MODULES_STORAGE_KEY, JSON.stringify(list));
        return true;
    } catch (e) {
        console.warn('[modules] No se pudo guardar el módulo. localStorage lleno.');
        return false;
    }
}

function loadUserModulesFromStorage() {
    var list = getUserModulesFromStorage();
    for (var i = 0; i < list.length; i++) {
        injectUserModule(list[i].code, 'storage:' + list[i].id);
    }
}

function persistUserModule(id, code) {
    var list = getUserModulesFromStorage();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) { idx = i; break; }
    }
    if (idx === -1) {
        list.push({ id: id, code: code });
    } else {
        list[idx].code = code;
    }
    return saveUserModulesToStorage(list);
}

function removeUserModuleFromStorage(id) {
    var list = getUserModulesFromStorage();
    list = list.filter(function (m) { return m.id !== id; });
    return saveUserModulesToStorage(list);
}

// ---------------------------------------------------------------------------
// Importación de módulos externos
// ---------------------------------------------------------------------------

function injectUserModule(code, source) {
    // Envuelve el código en una función para aislar el scope.
    // El módulo solo ve registerModule y console.
    try {
        var wrapper = new Function('registerModule', 'console', code);
        wrapper(registerUserModule, console);
    } catch (e) {
        console.warn('[modules] Error al inyectar módulo desde', source, ':', e.message);
    }
}

function registerUserModule(def) {
    if (!def || !def.id) return;
    def.external = true;
    registerModule(def);
}

function importUserModuleFromFile(file) {
    if (!file) return Promise.reject(new Error('Sin archivo'));
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () {
            var code = String(reader.result || '');
            if (!code.trim()) {
                reject(new Error('Archivo vacío'));
                return;
            }
            if (code.length > 500000) {
                reject(new Error('Archivo demasiado grande (máximo 500 KB)'));
                return;
            }

            var tempId = 'user-' + Date.now();
            var before = {};
            for (var id in MODULES) {
                if (MODULES.hasOwnProperty(id)) before[id] = true;
            }

            injectUserModule(code, 'file:' + file.name);

            var newId = null;
            for (var id in MODULES) {
                if (MODULES.hasOwnProperty(id) && !before[id]) { newId = id; break; }
            }

            if (!newId) {
                reject(new Error('El archivo no registró ningún módulo'));
                return;
            }

            persistUserModule(newId, code);
            resolve(newId);
        };
        reader.onerror = function () { reject(reader.error); };
        reader.readAsText(file);
    });
}

function removeUserModule(id) {
    var m = MODULES[id];
    if (!m || !m.external) return;
    unregisterModule(id);
    removeUserModuleFromStorage(id);
}

// ---------------------------------------------------------------------------
// Exponer la API de módulos a módulos externos
// ---------------------------------------------------------------------------

// registerUserModule ya está disponible para el wrapper.
// El resto de la API (ctx, feedback, sonido) se construye en navigation.js.