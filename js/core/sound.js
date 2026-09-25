// ===== Sonido de minijuegos =====
// Un solo sonido: correcto.mp3, reproducido al acertar en un minijuego.

function initGameSound() {
    try {
        gameSound = new Audio('correcto.mp3');
        gameSound.preload = 'auto';
    } catch (e) {
        gameSound = null;
    }
}

function playGameSound() {
    if (gameSoundMode === 'off' || !gameSound) return;
    try {
        gameSound.volume = gameSoundMode === 'soft' ? 0.35 : 1.0;
        gameSound.currentTime = 0;
        var p = gameSound.play();
        if (p && typeof p.catch === 'function') {
            p.catch(function () {});
        }
    } catch (e) {}
}

function setGameSound(newMode) {
    if (newMode !== 'off' && newMode !== 'soft' && newMode !== 'on') return;
    gameSoundMode = newMode;
    applyGameSoundUI();
    savePreferences();
}

function applyGameSoundUI() {
    document.querySelectorAll('.font-opt[data-gsound]').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.gsound === gameSoundMode);
    });
}

function soundIcon() {
    if (gameSoundMode === 'off') return '✕';
    if (gameSoundMode === 'soft') return '◐';
    return '♪';
}

function soundTitle() {
    if (gameSoundMode === 'off') return 'Sonido: apagado';
    if (gameSoundMode === 'soft') return 'Sonido: suave';
    return 'Sonido: activado';
}

function cycleGameSound() {
    var next;
    if (gameSoundMode === 'off') next = 'soft';
    else if (gameSoundMode === 'soft') next = 'on';
    else next = 'off';
    setGameSound(next);
}