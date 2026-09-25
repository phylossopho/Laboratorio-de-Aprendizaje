// ===== Módulo: Palabra por palabra =====

function getORPIndex(word) {
    var len = word.length;
    if (len <= 1) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
}

function renderWordDisplay() {
    if (!words || words.length === 0) return;
    if (currentIndex < 0 || currentIndex >= words.length) return;

    var word = words[currentIndex];
    var prev2 = currentIndex > 1 ? words[currentIndex - 2] : '';
    var prev1 = currentIndex > 0 ? words[currentIndex - 1] : '';
    var next1 = currentIndex < words.length - 1 ? words[currentIndex + 1] : '';
    var next2 = currentIndex < words.length - 2 ? words[currentIndex + 2] : '';

    var orpIndex = getORPIndex(word);
    var before = word.slice(0, orpIndex);
    var orpChar = word.charAt(orpIndex);
    var after = word.slice(orpIndex + 1);

    var html = '';
    if (prev2) html += '<span class="context-extra">' + escapeHtml(prev2) + '</span> ';
    if (prev1) html += '<span class="context">' + escapeHtml(prev1) + '</span> ';
    html += '<span class="focal">';
    html += escapeHtml(before);
    html += '<span class="pointer">' + escapeHtml(orpChar) + '</span>';
    html += escapeHtml(after);
    html += '</span>';
    if (next1) html += ' <span class="context">' + escapeHtml(next1) + '</span>';
    if (next2) html += ' <span class="context-extra">' + escapeHtml(next2) + '</span>';

    if (wordDisplay) wordDisplay.innerHTML = html;
}

function scheduleWordNext() {
    var delay = 60000 / wpm;
    scheduleTimeout = window.setTimeout(function () {
        advanceNext();
    }, delay);
}

function rescheduleWordNext() {
    if (scheduleTimeout !== null) {
        clearTimeout(scheduleTimeout);
        scheduleTimeout = null;
    }
    scheduleWordNext();
}

registerModule({
    id: 'word',
    category: 'reading',
    name: 'Palabra por palabra',
    icon: 'Aa',
    description: 'Las palabras aparecen una a una con puntero visual. Máxima velocidad de procesamiento.',
    hint: 'Para: velocidad pura',
    order: 1,
    shell: 'reading',
    render: function () { renderWordDisplay(); },
    schedule: function () { scheduleWordNext(); },
    reschedule: function () { rescheduleWordNext(); },
    stop: function () {
        if (scheduleTimeout !== null) {
            clearTimeout(scheduleTimeout);
            scheduleTimeout = null;
        }
    }
});