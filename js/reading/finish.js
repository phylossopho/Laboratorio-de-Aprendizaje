// ===== Fin de la lectura =====
// Maneja el mensaje "¡Fin!", el reinicio y la pausa.

function clearFinTimers() {
    if (finShowTimer !== null) {
        clearTimeout(finShowTimer);
        finShowTimer = null;
    }
    if (finCleanupTimer !== null) {
        clearTimeout(finCleanupTimer);
        finCleanupTimer = null;
    }
}

function showFinishMessage() {
    clearFinTimers();
    if (!wordDisplay) return;

    wordDisplay.innerHTML = '';
    wordDisplay.className = 'word-display';
    wordDisplay.style.opacity = '';
    wordDisplay.style.transition = '';

    finShowTimer = window.setTimeout(function () {
        if (isRunning) return;
        wordDisplay.innerHTML = '<span class="fin-message">¡Fin!</span>';

        finCleanupTimer = window.setTimeout(function () {
            if (isRunning) return;
            wordDisplay.innerHTML = '';
            wordDisplay.className = 'word-display';
            backToHome();
        }, 1900);
    }, 500);
}

function finishReading() {
    debugLog('reading', 'finishReading', { module: currentModuleId });
    isRunning = false;
    isPaused = false;
    clearCountdown();
    if (scheduleTimeout !== null) {
        clearTimeout(scheduleTimeout);
        scheduleTimeout = null;
    }

    if (btnPause) btnPause.disabled = true;
    if (pauseIconEl) pauseIconEl.textContent = '⏸';
    if (pauseIndicator) pauseIndicator.classList.add('hidden');
    stopTimer();
    if (controlsEl) controlsEl.classList.add('faded');
    if (lineTimerBar) lineTimerBar.style.display = 'none';

    showFinishMessage();
}

function resetReading() {
    isRunning = false;
    isPaused = false;
    clearCountdown();
    clearFinTimers();
    if (scheduleTimeout !== null) {
        clearTimeout(scheduleTimeout);
        scheduleTimeout = null;
    }

    currentIndex = 0;
    currentChunk = 0;
    currentSentence = 0;
    if (btnPause) btnPause.disabled = false;
    if (pauseIconEl) pauseIconEl.textContent = '▶';
    if (pauseIndicator) pauseIndicator.classList.add('hidden');
    stopTimer();

    if (wordDisplay) {
        wordDisplay.innerHTML = '<span>Prepara tu texto y haz clic en Iniciar</span>';
        wordDisplay.className = 'word-display';
        wordDisplay.style.opacity = '';
        wordDisplay.style.transition = '';
    }
    if (lineTimerBar) lineTimerBar.style.display = 'none';

    backToHome();
}

function togglePause() {
    if (!isRunning) return;
    debugLog('reading', 'togglePause', { isPaused: !isPaused });
    isPaused = !isPaused;
    if (pauseIconEl) pauseIconEl.textContent = isPaused ? '▶' : '⏸';
    if (pauseIndicator) pauseIndicator.classList.toggle('hidden', !isPaused);
    if (!isPaused) resetControlsFade();

    var mod = getModule(currentModuleId);

    if (isPaused) {
        if (scheduleTimeout !== null) {
            clearTimeout(scheduleTimeout);
            scheduleTimeout = null;
        }
        if (mod && typeof mod.pause === 'function') mod.pause();
    } else {
        if (mod && typeof mod.resume === 'function') mod.resume();
        else scheduleNext();
    }
}