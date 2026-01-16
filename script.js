const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Ваш браузер не поддерживает распознавание речи 😢");
}

// ===== Данные =====
const words = [
  { en: "apple", ru: "яблоко" },
  { en: "dog", ru: "собака" },
  { en: "house", ru: "дом" },
  { en: "car", ru: "машина" },
  { en: "water", ru: "вода" }
];

let currentWordIndex = 0;
let mistakesCount = 0;
let successStreak = 0;

// ===== DOM =====
const wordScreen = document.getElementById("word-screen");
const successScreen = document.getElementById("success-screen");
const failScreen = document.getElementById("fail-screen");
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const listeningIndicator = document.getElementById("listening-indicator");
const app = document.getElementById("app");

const backgrounds = {
  fresh: "assets/images/lavender-fresh.png",
  mid: "assets/images/lavender-mid.png",
  dead: "assets/images/lavender-dead.png"
};

const goodMemes = [
  "assets/images/yes1.jpeg",
  "assets/images/yes2.jpeg",
  "assets/images/yes3.jpeg"
];

const badMemes = [
  "assets/images/daleko.jpeg",
  "assets/images/nedumau.jpeg",
  "assets/images/skoreenet.jpeg",
  "assets/images/vradli.jpeg"
];

const bgMusic = document.getElementById("bg-music");
const successSound = document.getElementById("success-sound");
const failSound = document.getElementById("fail-sound");
failSound.volume = 0.1;

// ===== Глобальная активная сессия =====
let currentSession = null;

// ===== Класс сессии слова =====
class WordSession {
  constructor(word) {
    this.word = word;
    this.active = true;
    this.timeLeft = 3;
    this.canAnswer = true;
    this.timer = null;

    this.recognition = new SpeechRecognition();
    this.recognition.lang = "ru-RU";
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      if (!this.active) return;
      const spokenText = event.results[0][0].transcript.toLowerCase().trim();
      this.handleAnswer(spokenText);
    };

    this.recognition.onend = () => {
      if (!this.active) return;
      if (this.canAnswer) {
        this.handleFail();
      }
    };
  }

  start() {
    // Скрываем мемы
    wordScreen.classList.add("active");
    successScreen.classList.remove("active");
    failScreen.classList.remove("active");

    wordEl.textContent = this.word.en;
    listeningIndicator.style.opacity = 1;

    // Запуск Recognition
    try { this.recognition.start(); } catch(e) {}

    // Таймер
    this.timer = setInterval(() => {
      this.timeLeft--;
      timerEl.textContent = this.timeLeft;
      if (this.timeLeft <= 0) this.handleFail();
    }, 1000);

    timerEl.textContent = this.timeLeft;
  }

  stop() {
    this.active = false;
    this.canAnswer = false;
    clearInterval(this.timer);
    try { this.recognition.stop(); } catch(e) {}

    // Сбрасываем глобальную активную сессию
    if (currentSession === this) currentSession = null;
  }

  handleAnswer(result) {
    if (!this.canAnswer) return;
    this.canAnswer = false;

    const correct = this.word.ru.toLowerCase();
    if (result.includes(correct)) this.handleSuccess();
    else this.handleFail();
  }

  handleSuccess() {
    if (!this.active) return;
    this.stop();

    successStreak++;
    mistakesCount = 0;
    updateBackground();

    const randomGood = goodMemes[Math.floor(Math.random() * goodMemes.length)];
    document.getElementById("success-meme").src = randomGood;

    successScreen.classList.add("active");
    wordScreen.classList.remove("active");
    failScreen.classList.remove("active");

    successSound.play();

    setTimeout(() => startNextWord(), 1200);
  }

  handleFail() {
    if (!this.active) return;
    this.stop();

    mistakesCount++;
    successStreak = 0;
    updateBackground();

    const randomBad = badMemes[Math.floor(Math.random() * badMemes.length)];
    document.getElementById("fail-meme").src = randomBad;

    failScreen.classList.add("active");
    wordScreen.classList.remove("active");
    successScreen.classList.remove("active");

    failSound.play();
    setTimeout(() => {
      failSound.pause();
      failSound.currentTime = 0;
    }, 1000);

    setTimeout(() => startNextWord(), 1000);
  }
}

// ===== Функции игры =====
function startNextWord() {
  currentWordIndex++;
  if (currentWordIndex >= words.length) currentWordIndex = 0;
  startWordSession(words[currentWordIndex]);
}

function updateBackground() {
  if (mistakesCount === 0) app.style.backgroundImage = `url(${backgrounds.fresh})`;
  else if (mistakesCount === 1) app.style.backgroundImage = `url(${backgrounds.mid})`;
  else app.style.backgroundImage = `url(${backgrounds.dead})`;
}

function startWordSession(word) {
  // Если уже есть активная сессия, останавливаем её
  if (currentSession) currentSession.stop();

  currentSession = new WordSession(word);
  currentSession.start();
}

// ===== Старт игры =====
bgMusic.play().catch(() => {});
updateBackground();
startWordSession(words[currentWordIndex]);
