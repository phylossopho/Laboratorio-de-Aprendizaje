// ===== Estado global de la aplicación =====
// Todas las variables que el resto de módulos leen y escriben.

// --- Modo y preferencias de lectura ---
var mode = 'word';
var wpm = 250;
var chunkSize = 5;
var chunkPauseMs = 200;
var fontSize = 'medium';
var currentTheme = 'dark';
var sliderPos = 'bottom';
var controlSize = 'medium';

// --- Sonido ---
var gameSoundMode = 'off';
var gameSound = null;

// --- Temas ---
var CORE_THEMES = [
    { id: 'dark',  name: 'Pizarrón',   icon: '☾' },
    { id: 'neon',  name: 'Crepúsculo', icon: '✦' },
    { id: 'light', name: 'Papel',      icon: '☀' }
];
var customThemesCache = [];

// --- Preferencias por modo de lectura ---
var modePrefs = {
    word:     { wpm: 250, fontSize: 'medium' },
    chunk:    { wpm: 250, fontSize: 'medium', chunkSize: 5 },
    line:     { wpm: 220, fontSize: 'medium' },
    galactic: { wpm: 200, fontSize: 'medium' }
};

// --- Texto en proceso ---
var words = [];
var chunks = [];
var sentences = [];
var currentIndex = 0;
var currentChunk = 0;
var currentSentence = 0;
var lastText = '';

// --- Estado de la sesión de lectura ---
var isRunning = false;
var isPaused = false;
var scheduleTimeout = null;
var timerInterval = null;
var timerStart = 0;
var pausedDuration = 0;

// --- Timers de UI ---
var finShowTimer = null;
var finCleanupTimer = null;
var countdownEl = null;
var countdownTimer = null;
var controlsFadeTimer = null;
var savePrefsTimer = null;

// --- Pantallas ---
var homeScreen = null;
var mainArea = null;
var currentCategoryId = null;
var currentModuleId = null;
var moduleContainer = null;

// --- Referencias DOM (se rellenan en cacheDOM) ---
var wordDisplay = null;
var wpmSlider = null;
var wpmDisplay = null;
var settingsWpmSlider = null;
var settingsWpmDisplay = null;
var lineTimerBar = null;
var lineTimerFill = null;
var pauseIndicator = null;
var pauseIconEl = null;
var btnPause = null;
var btnReset = null;
var inputText = null;
var controlsEl = null;
var chunkSizeDisplay = null;
var chunkSizeGroup = null;

// --- Modales ---
var configModal = null;
var textsModal = null;
var gamesModal = null;
var settingsModal = null;