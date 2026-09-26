// ===== Control genérico de minijuegos =====
// Botonera independiente para pausar, reiniciar, volumen y volver.
// Pensada para reutilizar en cualquier juego sin acoplarse a la lógica de Schulte.

var gameControlState = {
    currentGameId: null,
    isPaused: false,
    showTimer: true,
    timerInterval: null,
    timerStart: 0,
    pausedDuration: 0,
    pauseStart: 0
};

function mountGameControls(gameId) {
    gameControlState.currentGameId = gameId;
    gameControlState.isPaused = false;
    gameControlState.showTimer = true;
    gameControlState.pausedDuration = 0;
    gameControlState.pauseStart = 0;
    clearGameTimer();
    gameControlState.timerStart = Date.now();
    updateGameTimerDisplay();
}

function unmountGameControls() {
    clearGameTimer();
    gameControlState.currentGameId = null;
    gameControlState.isPaused = false;
    gameControlState.showTimer = false;
    gameControlState.pausedDuration = 0;
    gameControlState.pauseStart = 0;
    gameControlState.timerStart = 0;
    updateGameTimerDisplay();
}

function toggleGamePause() {
    var mod = getModule(gameControlState.currentGameId);
    if (!mod || !mod.actions) return;

    gameControlState.isPaused = !gameControlState.isPaused;

    if (gameControlState.isPaused) {
        if (mod.actions.pause) mod.actions.pause();
        gameControlState.pauseStart = Date.now();
    } else {
        if (mod.actions.resume) mod.actions.resume();
        var now = Date.now();
        gameControlState.pausedDuration += now - gameControlState.pauseStart;
        gameControlState.timerStart += now - gameControlState.pauseStart;
    }

    updateGamePauseIcon();
}

function updateGamePauseIcon() {
    var icon = document.getElementById('game-pause-icon');
    if (icon) icon.textContent = gameControlState.isPaused ? '▶' : '⏸';
}

function restartCurrentGame() {
    var mod = getModule(gameControlState.currentGameId);
    if (!mod || !mod.actions || !mod.actions.restart) return;

    clearGameTimer();
    gameControlState.isPaused = false;
    gameControlState.pausedDuration = 0;
    gameControlState.pauseStart = 0;
    updateGamePauseIcon();
    gameControlState.timerStart = Date.now();
    startGameTimer();
    updateGameTimerDisplay();

    mod.actions.restart();
}

function adjustGameVolume(delta) {
    var modes = ['off', 'low', 'medium', 'high', 'max'];
    var idx = modes.indexOf(gameSoundMode);
    if (idx === -1) idx = 0;
    var next = idx + delta;
    next = Math.max(0, Math.min(modes.length - 1, next));
    gameSoundMode = modes[next];
}

function toggleGameTimer() {
    gameControlState.showTimer = !gameControlState.showTimer;
    updateGameTimerDisplay();
    if (gameControlState.showTimer) {
        startGameTimer();
    } else {
        clearGameTimer();
    }
}

function startGameTimer() {
    clearGameTimer();
    gameControlState.timerStart = Date.now();
    gameControlState.timerInterval = setInterval(function () {
        if (!gameControlState.isPaused) {
            updateGameTimerDisplay();
        }
    }, 1000);
}

function clearGameTimer() {
    if (gameControlState.timerInterval !== null) {
        clearInterval(gameControlState.timerInterval);
        gameControlState.timerInterval = null;
    }
}

function stopGameTimer() {
    clearGameTimer();
    updateGameTimerDisplay();
}

function updateGameTimerDisplay() {
    var display = document.getElementById('game-timer-display');
    if (!display) return;
    if (!gameControlState.showTimer) {
        display.textContent = '⏱';
        return;
    }
    var elapsed = Date.now() - gameControlState.timerStart;
    var totalSeconds = Math.floor(elapsed / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    display.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function gameBack() {
    var mod = getModule(gameControlState.currentGameId);
    if (mod && mod.actions && mod.actions.stop) {
        mod.actions.stop();
    }
    unmountGameControls();
    goBack();
}
