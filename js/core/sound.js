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
        var volume = 1.0;
        if (gameSoundMode === 'low') volume = 0.25;
        else if (gameSoundMode === 'medium') volume = 0.5;
        else if (gameSoundMode === 'high') volume = 1.0;
        gameSound.volume = volume;
        gameSound.currentTime = 0;
        var p = gameSound.play();
        if (p && typeof p.catch === 'function') {
            p.catch(function () {});
        }
    } catch (e) {}
}

function playGameSound() {
    if (gameSoundMode === 'off' || !gameSound) return;
    try {
        var volume = 1.0;
        if (gameSoundMode === 'low') volume = 0.25;
        else if (gameSoundMode === 'medium') volume = 0.5;
        else if (gameSoundMode === 'high') volume = 0.75;
        else if (gameSoundMode === 'max') volume = 1.0;
        gameSound.volume = volume;
        gameSound.currentTime = 0;
        var p = gameSound.play();
        if (p && typeof p.catch === 'function') {
            p.catch(function () {});
        }
    } catch (e) {}
}

function setGameSound(newMode) {
    if (!['off', 'low', 'medium', 'high', 'max'].includes(newMode)) return;
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
    if (gameSoundMode === 'low') return '🔈';
    if (gameSoundMode === 'medium') return '🔉';
    if (gameSoundMode === 'high') return '🔊';
    return '🔊';
}

function soundTitle() {
    if (gameSoundMode === 'off') return 'Sonido: apagado';
    if (gameSoundMode === 'low') return 'Sonido: 25%';
    if (gameSoundMode === 'medium') return 'Sonido: 50%';
    if (gameSoundMode === 'high') return 'Sonido: 75%';
    if (gameSoundMode === 'max') return 'Sonido: 100%';
    return 'Sonido';
}

function cycleGameSound() {
    var modes = ['off', 'low', 'medium', 'high', 'max'];
    var idx = modes.indexOf(gameSoundMode);
    if (idx === -1) idx = 0;
    var next = modes[(idx + 1) % modes.length];
    setGameSound(next);
}