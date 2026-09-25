// ===== Referencias al DOM =====
// cacheDOM() se llama una sola vez en app.js al arrancar.
// Las variables están declaradas en state.js.

function cacheDOM() {
    homeScreen = document.getElementById('home-screen');
    mainArea = document.getElementById('main-area');
    moduleContainer = document.getElementById('module-container');

    wordDisplay = document.getElementById('word-display');
    wpmSlider = document.getElementById('wpm-slider');
    wpmDisplay = document.getElementById('wpm-display');
    settingsWpmSlider = document.getElementById('settings-wpm-slider');
    settingsWpmDisplay = document.getElementById('settings-wpm');

    lineTimerBar = document.getElementById('line-timer-bar');
    lineTimerFill = document.getElementById('line-timer-fill');
    pauseIndicator = document.getElementById('pause-indicator');
    pauseIconEl = document.getElementById('pause-icon');
    btnPause = document.getElementById('btn-pause');
    btnReset = document.getElementById('btn-reset');
    inputText = document.getElementById('input-text');
    controlsEl = document.getElementById('reading-controls');
    countdownEl = document.getElementById('countdown-el');
    chunkSizeDisplay = document.getElementById('chunk-size-display');
    chunkSizeGroup = document.getElementById('chunk-size-group');

    configModal = document.getElementById('config-modal');
    textsModal = document.getElementById('texts-modal');
    gamesModal = document.getElementById('games-modal');
    settingsModal = document.getElementById('settings-modal');
}