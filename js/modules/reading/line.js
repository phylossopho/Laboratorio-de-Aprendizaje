// ===== Módulo: Frases completas =====

var lineSentenceStart = 0;
var lineSentenceDuration = 0;
var linePausedAt = 0;
var lineIsRunning = false;
var lineSentences = [];

function renderLineDisplay() {
    if (!lineSentences || lineSentences.length === 0) return;
    if (currentSentence < 0 || currentSentence >= lineSentences.length) return;

    var sentence = lineSentences[currentSentence];
    if (wordDisplay) {
        wordDisplay.classList.remove('chunk-mode');
        wordDisplay.innerHTML = '<div class="line-display">' + escapeHtml(sentence) + '</div>';
    }

    lineSentenceStart = Date.now();
    linePausedAt = 0;
    lineIsRunning = true;

    var wordCount = sentence.trim().split(/\s+/).filter(function (w) {
        return w.length > 0;
    }).length;
    lineSentenceDuration = (wordCount / wpm) * 60000;

    if (lineTimerBar) lineTimerBar.style.display = '';
    if (lineTimerFill) lineTimerFill.style.width = '0%';
}

function scheduleLineNext() {
    if (!lineIsRunning) return;
    var elapsed = Date.now() - lineSentenceStart;
    var remaining = lineSentenceDuration - elapsed;
    if (remaining < 0) remaining = 0;

    scheduleTimeout = window.setTimeout(function () {
        advanceNext();
    }, remaining);
}

function rescheduleLineNext() {
    if (scheduleTimeout !== null) {
        clearTimeout(scheduleTimeout);
        scheduleTimeout = null;
    }
    if (isPaused) return;

    if (currentSentence < lineSentences.length) {
        var sentence = lineSentences[currentSentence];
        if (sentence) {
            var wordCount = sentence.trim().split(/\s+/).filter(function (w) {
                return w.length > 0;
            }).length;
            lineSentenceDuration = (wordCount / wpm) * 60000;
        }
    }
    lineSentenceStart = Date.now();
    linePausedAt = 0;

    scheduleLineNext();
}

function updateLineTimer() {
    if (!lineIsRunning || lineSentenceDuration <= 0) return;
    if (currentSentence >= lineSentences.length) return;

    var elapsed = Date.now() - lineSentenceStart;
    if (linePausedAt > 0) {
        elapsed = linePausedAt - lineSentenceStart;
    }

    var percent = (elapsed / lineSentenceDuration) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    if (lineTimerFill) lineTimerFill.style.width = percent + '%';
}

function pauseLineTimer() {
    if (!lineIsRunning) return;
    linePausedAt = Date.now();
}

function resumeLineTimer() {
    if (!lineIsRunning) return;
    if (linePausedAt > 0) {
        var pausedFor = Date.now() - linePausedAt;
        lineSentenceStart += pausedFor;
        linePausedAt = 0;
    }
}

registerModule({
    id: 'line',
    category: 'reading',
    name: 'Frases completas',
    icon: '☰',
    description: 'Lees la frase completa visible en pantalla. Avance automático según velocidad.',
    hint: 'Para: lectura natural a ritmo',
    order: 3,
    shell: 'reading',
    render: function () {
        if (lineSentences.length === 0 && sentences.length > 0) {
            lineSentences = splitSentencesSmart(sentences.join(' '), 14);
        }
        renderLineDisplay();
    },
    schedule: function () { scheduleLineNext(); },
    reschedule: function () { rescheduleLineNext(); },
    pause: function () { pauseLineTimer(); },
    resume: function () { resumeLineTimer(); },
    stop: function () {
        lineIsRunning = false;
        linePausedAt = 0;
        lineSentenceStart = 0;
        lineSentenceDuration = 0;
        lineSentences = [];
        if (lineTimerBar) lineTimerBar.style.display = 'none';
        if (lineTimerFill) lineTimerFill.style.width = '0%';
    }
});