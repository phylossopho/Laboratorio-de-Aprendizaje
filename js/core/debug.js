// ===== Sistema de debug =====
// Botón flotante que copia el log al portapapeles.
// Se activa con:
//   - Ctrl+Shift+D
//   - ?debug=1 en la URL

var DEBUG_ENABLED = false;
var DEBUG_LOGS = [];
var DEBUG_MAX = 500;
var debugFab = null;

function initDebug() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('debug') === '1') DEBUG_ENABLED = true;

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
            e.preventDefault();
            DEBUG_ENABLED = !DEBUG_ENABLED;
            if (DEBUG_ENABLED) showDebugFab();
            else hideDebugFab();
        }
    });

    window.addEventListener('error', function (e) {
        debugLog('error', e.message, {
            file: (e.filename || '').split('/').pop(),
            line: e.lineno,
            col: e.colno
        });
    });

    window.addEventListener('unhandledrejection', function (e) {
        debugLog('promise', 'Rechazo no manejado', { reason: String(e.reason) });
    });

    if (DEBUG_ENABLED) showDebugFab();

    debugLog('debug', 'Sistema de debug listo');
}

function debugLog(cat, msg, data) {
    var entry = {
        t: new Date(),
        cat: cat,
        msg: msg,
        data: data
    };
    DEBUG_LOGS.push(entry);
    if (DEBUG_LOGS.length > DEBUG_MAX) DEBUG_LOGS.shift();
}

function showDebugFab() {
    if (debugFab) return;
    debugFab = document.createElement('button');
    debugFab.id = 'debug-fab';
    debugFab.type = 'button';
    debugFab.textContent = '🐛';
    debugFab.setAttribute('aria-label', 'Copiar log de debug');
    debugFab.title = 'Copiar log de debug';
    debugFab.addEventListener('click', function () {
        copyDebugLogs();
    });
    document.body.appendChild(debugFab);
}

function hideDebugFab() {
    if (debugFab && debugFab.parentNode) {
        debugFab.parentNode.removeChild(debugFab);
        debugFab = null;
    }
}

function copyDebugLogs() {
    var text = '';
    DEBUG_LOGS.forEach(function (e) {
        var time = e.t.toTimeString().slice(0, 8) + '.' + String(e.t.getMilliseconds()).padStart(3, '0');
        var dataStr = '';
        if (e.data !== undefined) {
            try { dataStr = ' ' + JSON.stringify(e.data); } catch (err) { dataStr = ' [data]'; }
        }
        text += '[' + time + '] ' + e.cat + ' | ' + e.msg + dataStr + '\n';
    });

    if (!text) {
        text = '(sin logs)';
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
            flashDebugFab('Copiado');
        }).catch(function () {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        flashDebugFab('Copiado');
    } catch (err) {
        flashDebugFab('Error');
    }
    document.body.removeChild(ta);
}

function flashDebugFab(msg) {
    if (!debugFab) return;
    var original = debugFab.textContent;
    debugFab.textContent = msg;
    debugFab.disabled = true;
    window.setTimeout(function () {
        debugFab.textContent = original;
        debugFab.disabled = false;
    }, 1200);
}