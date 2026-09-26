// ===== Minijuego: Tabla de Schulte =====

var schulteState = null;

var SCHULTE_LEVELS = { 3: 'Fácil', 4: 'Medio', 5: 'Difícil' };

function startSchulte() {
    var screen = document.getElementById('game-screen');
    if (!screen) return;
    schulteCleanup();
    screen.classList.remove('hidden');
    screen.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'game-screen-header';

    var title = document.createElement('h2');
    title.className = 'game-screen-title';
    title.textContent = 'Tabla de Schulte';

    header.appendChild(title);
    screen.appendChild(header);

    var intro = document.createElement('p');
    intro.className = 'schulte-intro';
    intro.textContent = 'Encuentra los números en orden. Mira el punto central y deja que tu vista encuentre los números a su alrededor.';
    screen.appendChild(intro);

    var diffGrid = document.createElement('div');
    diffGrid.className = 'schulte-difficulty-grid';

    [{ label: 'Fácil', size: 3, sub: '3 × 3' },
     { label: 'Medio', size: 4, sub: '4 × 4' },
     { label: 'Difícil', size: 5, sub: '5 × 5' }].forEach(function (opt) {
        var btn = document.createElement('button');
        btn.className = 'schulte-difficulty-btn';

        var lbl = document.createElement('div');
        lbl.className = 'schulte-difficulty-label';
        lbl.textContent = opt.label;

        var sub = document.createElement('div');
        sub.className = 'schulte-difficulty-sub';
        sub.textContent = opt.sub;

        var completed = schulteGetCompletedCount(opt.size);
        var counter = document.createElement('div');
        counter.className = 'schulte-difficulty-best';
        counter.textContent = schulteFormatCompleted(completed);

        btn.appendChild(lbl);
        btn.appendChild(sub);
        btn.appendChild(counter);
        btn.addEventListener('click', function () { schulteShowInstructions(opt.size); });
        diffGrid.appendChild(btn);
    });

    screen.appendChild(diffGrid);
}

function closeSchulte() {
    var screen = document.getElementById('game-screen');
    if (screen) {
        screen.classList.add('hidden');
        screen.innerHTML = '';
    }
    schulteCleanup();
}

function schulteCleanup() {
    document.removeEventListener('keydown', schulteHandleKeydown);
    schulteState = null;
}

function schulteShowInstructions(size) {
    var screen = document.getElementById('game-screen');
    if (!screen) return;
    schulteCleanup();
    screen.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'game-screen-header';

    var title = document.createElement('h2');
    title.className = 'game-screen-title';
    title.textContent = 'Tabla de Schulte';

    header.appendChild(title);
    screen.appendChild(header);

    var box = document.createElement('div');
    box.className = 'schulte-instructions';

    var level = document.createElement('div');
    level.className = 'schulte-instructions-level';
    level.textContent = SCHULTE_LEVELS[size] + ' · ' + size + ' × ' + size;

    var heading = document.createElement('h3');
    heading.className = 'schulte-instructions-title';
    heading.textContent = 'Antes de empezar';

    var text = document.createElement('p');
    text.className = 'schulte-instructions-text';
    text.textContent = 'Fija la mirada en el punto central. Sin mover los ojos de ahí, encuentra los números en orden del 1 al ' + (size * size) + '.';

    var actions = document.createElement('div');
    actions.className = 'schulte-instructions-actions';

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', startSchulte);

    var goBtn = document.createElement('button');
    goBtn.className = 'btn btn-primary';
    goBtn.textContent = 'Empezar';
    goBtn.addEventListener('click', function () { schulteShowCountdownAndBegin(size); });

    actions.appendChild(cancelBtn);
    actions.appendChild(goBtn);
    box.appendChild(level);
    box.appendChild(heading);
    box.appendChild(text);
    box.appendChild(actions);
    screen.appendChild(box);
}

function schulteBeginGame(size) {
    schultePrepareGameScreen(size);
    schultePopulateBoard(size);
}

function schulteShowCountdownAndBegin(size) {
    schultePrepareGameScreen(size);
    startReadingCountdown(function () {
        schultePopulateBoard(size);
    });
}

function schultePrepareGameScreen(size) {
    var screen = document.getElementById('game-screen');
    if (!screen) return;
    schulteCleanup();
    screen.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'game-screen-header';

    var title = document.createElement('h2');
    title.className = 'game-screen-title';
    title.textContent = 'Tabla de Schulte';

    header.appendChild(title);
    screen.appendChild(header);

    var promptEl = document.createElement('div');
    promptEl.className = 'schulte-prompt';
    promptEl.textContent = '1';
    screen.appendChild(promptEl);

    var counterEl = document.createElement('div');
    counterEl.className = 'schulte-counter';
    counterEl.textContent = '1 de ' + (size * size);
    screen.appendChild(counterEl);

    var gridArea = document.createElement('div');
    gridArea.className = 'schulte-grid-area';

    var grid = document.createElement('div');
    grid.className = 'schulte-grid';
    grid.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';
    gridArea.appendChild(grid);

    var dot = document.createElement('div');
    dot.className = 'schulte-center-dot';
    dot.setAttribute('aria-hidden', 'true');
    gridArea.appendChild(dot);

    screen.appendChild(gridArea);

    var progressBar = document.createElement('div');
    progressBar.className = 'schulte-progress-bar';
    var progressFill = document.createElement('div');
    progressFill.className = 'schulte-progress-fill';
    progressBar.appendChild(progressFill);
    screen.appendChild(progressBar);

    var pauseOverlay = document.createElement('div');
    pauseOverlay.className = 'schulte-pause-overlay hidden';
    var pauseText = document.createElement('div');
    pauseText.className = 'schulte-pause-text';
    pauseText.textContent = 'PAUSADO';
    var pauseHint = document.createElement('div');
    pauseHint.className = 'schulte-pause-hint';
    pauseHint.textContent = 'Pulsa en cualquier parte para continuar';
    pauseOverlay.appendChild(pauseText);
    pauseOverlay.appendChild(pauseHint);
    pauseOverlay.addEventListener('click', schulteTogglePause);
    screen.appendChild(pauseOverlay);

    schulteState = {
        size: size,
        total: size * size,
        nextNumber: 1,
        isPaused: false,
        screen: screen,
        promptEl: promptEl,
        counterEl: counterEl,
        grid: grid,
        progressFill: progressFill,
        pauseOverlay: pauseOverlay
    };

    schulteUpdateProgress();
    document.addEventListener('keydown', schulteHandleKeydown);
}

function schultePopulateBoard(size) {
    if (!schulteState) return;
    var total = schulteState.total;
    var numbers = [];
    for (var i = 1; i <= total; i++) numbers.push(i);
    for (var j = numbers.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var tmp = numbers[j]; numbers[j] = numbers[k]; numbers[k] = tmp;
    }

    var grid = schulteState.grid;
    grid.innerHTML = '';

    numbers.forEach(function (num) {
        var cell = document.createElement('button');
        cell.className = 'schulte-cell';
        cell.textContent = String(num);
        cell.addEventListener('click', function (e) { schulteHandleClick(num, cell, e); });
        grid.appendChild(cell);
    });

    schulteState.nextNumber = 1;
    schulteState.promptEl.textContent = '1';
    schulteState.counterEl.textContent = '1 de ' + total;
    schulteUpdateProgress();

    if (typeof startGameTimer === 'function') startGameTimer();
    showGameControlsDOM();
}

function schulteHandleKeydown(e) {
    if (!schulteState) return;
    if (e.code === 'Space' || e.code === 'KeyP') {
        e.preventDefault();
        schulteTogglePause();
    } else if (e.code === 'KeyR') {
        e.preventDefault();
        schulteBeginGame(schulteState.size);
    }
}

function schulteTogglePause() {
    if (!schulteState) return;
    schulteState.isPaused = !schulteState.isPaused;
    if (schulteState.isPaused) {
        schulteState.pauseOverlay.classList.remove('hidden');
    } else {
        schulteState.pauseOverlay.classList.add('hidden');
    }
}

function schulteUpdateProgress() {
    if (!schulteState) return;
    var found = schulteState.nextNumber - 1;
    var percent = (found / schulteState.total) * 100;
    schulteState.progressFill.style.width = percent + '%';
}

function schulteHandleClick(num, cell, event) {
    if (!schulteState) return;
    if (schulteState.isPaused) return;
    if (num !== schulteState.nextNumber) return;

    var rect = cell.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    feedbackFull(cx, cy);
    feedbackLocal(cell);
    feedbackPulse(schulteState.promptEl);

    cell.classList.add('schulte-correct');
    cell.disabled = true;

    schulteState.nextNumber++;
    var total = schulteState.size * schulteState.size;

    if (schulteState.nextNumber > total) {
        schulteState.promptEl.textContent = '✓';
        schulteState.counterEl.textContent = total + ' de ' + total;
        schulteUpdateProgress();
        schulteFinish();
        return;
    }

    schulteState.promptEl.textContent = String(schulteState.nextNumber);
    schulteState.counterEl.textContent = schulteState.nextNumber + ' de ' + total;
    schulteUpdateProgress();
}

function schulteFinish() {
    if (!schulteState) return;
    var size = schulteState.size;
    var screen = schulteState.screen;

    schulteIncrementCompletedCount(size);
    var completed = schulteGetCompletedCount(size);

    var overlay = document.createElement('div');
    overlay.className = 'schulte-finish';

    var title = document.createElement('div');
    title.className = 'schulte-finish-title';
    title.textContent = '¡Completado!';

    var msg = document.createElement('div');
    msg.className = 'schulte-finish-msg';
    msg.textContent = 'Encontraste los ' + (size * size) + ' números.';

    overlay.appendChild(title);
    overlay.appendChild(msg);

    if (completed >= 2) {
        var progress = document.createElement('div');
        progress.className = 'schulte-finish-progress';
        progress.textContent = 'Llevas ' + completed + ' tablas en ' + SCHULTE_LEVELS[size] + '.';
        overlay.appendChild(progress);
    }

    var actions = document.createElement('div');
    actions.className = 'schulte-finish-actions';

    var againBtn = document.createElement('button');
    againBtn.className = 'btn btn-primary';
    againBtn.textContent = 'Otra vez';
    againBtn.addEventListener('click', function () { schulteShowCountdownAndBegin(size); });

    var menuBtn = document.createElement('button');
    menuBtn.className = 'btn btn-secondary';
    menuBtn.textContent = 'Elegir dificultad';
    menuBtn.addEventListener('click', startSchulte);

    actions.appendChild(againBtn);
    actions.appendChild(menuBtn);
    overlay.appendChild(actions);
    screen.appendChild(overlay);

    if (typeof stopGameTimer === 'function') stopGameTimer();
    if (gameControlState && typeof gameControlState.timerStart !== 'undefined') {
        gameControlState.timerStart = Date.now();
    }
    updateGameTimerDisplay();
}

function schulteGetCompletedCount(size) {
    try {
        var raw = localStorage.getItem('schulte-completed-' + size);
        if (!raw) return 0;
        var val = parseInt(raw, 10);
        return isNaN(val) || val < 0 ? 0 : val;
    } catch (e) { return 0; }
}

function schulteIncrementCompletedCount(size) {
    try {
        var current = schulteGetCompletedCount(size);
        localStorage.setItem('schulte-completed-' + size, String(current + 1));
    } catch (e) {}
}

function schulteFormatCompleted(count) {
    if (count === 0) return 'Sin completar todavía';
    if (count === 1) return '1 tabla completada';
    return count + ' tablas completadas';
}

registerModule({
    id: 'schulte',
    category: 'games',
    name: 'Tabla de Schulte',
    icon: '⚏',
    description: 'Encuentra los números del 1 al 25 en orden. Entrena la visión periférica.',
    hint: 'Para: descanso visual',
    order: 1,
    shell: 'game',
    render: function () { startSchulte(); },
    stop: function () { closeSchulte(); },
    actions: {
        pause: function () {
            if (schulteState && !schulteState.isPaused) {
                schulteTogglePause();
            }
        },
        resume: function () {
            if (schulteState && schulteState.isPaused) {
                schulteTogglePause();
            }
        },
        restart: function () {
            var size = schulteState ? schulteState.size : 3;
            schulteShowCountdownAndBegin(size);
        },
        stop: function () { closeSchulte(); }
    }
});