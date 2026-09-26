// ===== Motor de lectura =====
// Orquesta el countdown, la carga del texto y el avance entre pasos.
// Delega el render y la programación del siguiente paso al módulo activo.

function loadText(text) {
    words = text.trim().split(/\s+/).filter(function (w) { return w.length > 0; });
    sentences = splitSentences(text);
    chunks = splitIntoChunks(text, chunkSize);
    lastText = text;
    try { localStorage.setItem('reading-last-text', text); } catch (e) {}
}

function getInputText() {
    if (inputText && inputText.value && inputText.value.trim()) {
        return inputText.value;
    }
    return lastText || '';
}

// ---------------------------------------------------------------------------
// Countdown 3-2-1
// ---------------------------------------------------------------------------

function clearCountdown() {
    if (countdownTimer !== null) {
        clearTimeout(countdownTimer);
        countdownTimer = null;
    }
    if (countdownEl) {
        countdownEl.classList.add('hidden');
        countdownEl.classList.remove('pulse');
        countdownEl.textContent = '';
    }
}

function startReadingCountdown(startCb) {
    debugLog('reading', 'Countdown iniciado', { module: currentModuleId, wpm: wpm, words: words.length });
    clearCountdown();

    if (!countdownEl) {
        startCb();
        return;
    }

    var count = 3;
    if (wordDisplay) {
        wordDisplay.style.animation = 'none';
        wordDisplay.style.opacity = '0';
    }

    function tick() {
        countdownEl.classList.remove('hidden');
        countdownEl.style.animation = 'none';
        void countdownEl.offsetWidth;
        countdownEl.style.animation = '';
        countdownEl.textContent = String(count);

        count--;
        if (count > 0) {
            countdownTimer = window.setTimeout(tick, 1000);
        } else {
            countdownTimer = window.setTimeout(function () {
                clearCountdown();
                if (wordDisplay) {
                    wordDisplay.style.transition = 'opacity 1s ease';
                    wordDisplay.style.opacity = '1';
                }
                startCb();
            }, 1000);
        }
    }

    tick();
}

// ---------------------------------------------------------------------------
// Avance entre pasos
// ---------------------------------------------------------------------------

function advanceNext() {
    if (!isRunning) return;
    debugLog('reading', 'advanceNext', { mod: currentModuleId, idx: currentIndex, chunk: currentChunk, sent: currentSentence });

    if (currentModuleId === 'word') {
        currentIndex++;
        if (currentIndex >= words.length) { finishReading(); return; }
    } else if (currentModuleId === 'chunk') {
        currentChunk++;
        if (currentChunk >= chunks.length) { finishReading(); return; }
    } else if (currentModuleId === 'line') {
        currentSentence++;
        if (currentSentence >= sentences.length) { finishReading(); return; }
    } else if (currentModuleId === 'galactic') {
        return;
    }

    renderDisplay();
    scheduleNext();
}

function advancePrevious() {
    if (currentModuleId === 'word' && currentIndex > 0) {
        currentIndex--;
        renderDisplay();
    }
}

function renderDisplay() {
    var mod = getModule(currentModuleId);
    if (!mod) return;
    mod.render(buildContext(mod, ''));
}

function scheduleNext() {
    if (!isRunning || isPaused) return;
    var mod = getModule(currentModuleId);
    if (!mod) return;
    mod.schedule(buildContext(mod, ''));
}

// ---------------------------------------------------------------------------
// Timer general (solo relevante para modo línea)
// ---------------------------------------------------------------------------

function startTimer() {
    timerStart = Date.now();
    pausedDuration = 0;
    stopTimer();
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimer() {
    if (!isRunning) return;
    if (currentModuleId === 'line' && !isPaused && typeof updateLineTimer === 'function') {
        updateLineTimer();
    }
}