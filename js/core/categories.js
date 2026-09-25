// ===== Categorías =====
// Se registran al cargar este archivo. El orden importa para la pantalla de inicio.

function registerCoreCategories() {
    registerCategory({
        id: 'reading',
        name: 'Lectura veloz',
        icon: '✦',
        description: 'Motores para entrenar velocidad y comprensión.',
        order: 1,
        open: function () { openCategoryScreen('reading'); }
    });

    registerCategory({
        id: 'games',
        name: 'Minijuegos',
        icon: '❖',
        description: 'Pausas activas para descansar la vista.',
        order: 2,
        open: function () { openCategoryScreen('games'); }
    });

    registerCategory({
        id: 'texts',
        name: 'Textos',
        icon: '▤',
        description: 'Tu biblioteca personal de textos para practicar.',
        order: 3,
        open: function () { openCategoryScreen('texts'); }
    });
}

registerCoreCategories();