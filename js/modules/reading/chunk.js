// ===== Módulo: Palabras en grupo =====

function renderChunkDisplay() {
    if (!chunks || chunks.length === 0) return;
    if (currentChunk < 0 || currentChunk >= chunks.length) return;

    var chunk = chunks[currentChunk];

    if (wordDisplay) {
        wordDisplay.classList.add('chunk-mode');

        var wordsHtml = chunk.words.map(function (w) {
            return '<span class="chunk-word">' + escapeHtml(w) + '</span>';
        }).join('');

        wordDisplay.innerHTML = '<div class="chunk-box">' + wordsHtml + '</div>';
    }
}

function scheduleChunkNext() {
    var delay = 60000 / wpm;
    scheduleTimeout = window.setTimeout(function () {
        advanceNext();
    }, delay);
}

function rescheduleChunkNext() {
    if (scheduleTimeout !== null) {
        clearTimeout(scheduleTimeout);
        scheduleTimeout = null;
    }
    scheduleChunkNext();
}

registerModule({
    id: 'chunk',
    category: 'reading',
    name: 'Palabras en grupo',
    icon: 'A·A',
    description: 'Lee grupos de palabras separados por comas y puntos. Respetan la puntuación.',
    hint: 'Para: velocidad + comprensión',
    order: 2,
    shell: 'reading',
    render: function () { renderChunkDisplay(); },
    schedule: function () { scheduleChunkNext(); },
    reschedule: function () { rescheduleChunkNext(); },
    stop: function () {
        if (wordDisplay) wordDisplay.classList.remove('chunk-mode');
        if (scheduleTimeout !== null) {
            clearTimeout(scheduleTimeout);
            scheduleTimeout = null;
        }
    }
});