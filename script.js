// ===== Данные =====
const words = [
  { en: "apple", ru: "яблоко" },
  { en: "dog", ru: "собака" },
  { en: "house", ru: "дом" },
  { en: "car", ru: "машина" },
  { en: "water", ru: "вода" }
];

let currentWordIndex = 0;
let gameState = "TASK";
let timer = null;
let timeLeft = 3; // секунды на ответ

// ===== DOM =====
const wordScreen = document.getElementById("word-screen");
const successScreen = document.getElementById("success-screen");
const failScreen = document.getElementById("fail-screen");
const wordEl = document.getElementById("word");
const timerEl = document.getElementById("timer");
const listeningIndicator = document.getElementById("listening-indicator");

// Добрые мемы
const goodMemes = [
  "assets/images/yes1.jpeg",
  "assets/images/yes2.jpeg",
  "assets/images/yes3.jpeg"
];

// Злые мемы
const badMemes = [
  "assets/images/daleko.jpeg",
  "assets/images/nedumau.jpeg",
  "assets/images/skoreenet.jpeg",
  "assets/images/vradli.jpeg"
];

// Аудио
const bgMusic = document.getElementById("bg-music");
const successSound = document.getElementById("success-sound");
const failSound = document.getElementById("fail-sound");

// ===== Функции =====
function setState(state) {
  gameState = state;

  // Скрываем все экраны
  wordScreen.classList.remove("active");
  successScreen.classList.remove("active");
  failScreen.classList.remove("active");

  switch(state) {
    case "TASK":
      wordScreen.classList.add("active");
      listeningIndicator.style.opacity = 0; // скрываем индикатор на TASK
      wordEl.textContent = words[currentWordIndex].en;
      setTimeout(() => setState("LISTENING"), 500); // авто-переход
      break;

    case "LISTENING":
      wordScreen.classList.add("active");
      listeningIndicator.style.opacity = 1;
      timeLeft = 3;
      timerEl.textContent = timeLeft;
      timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(timer);
          setState("FAIL"); // тайм-аут = провал
        }
      }, 1000);
      break;

    case "SUCCESS":
      successScreen.classList.add("active");
      const randomGood = goodMemes[Math.floor(Math.random() * goodMemes.length)];
      console.log("Выбранный GOOD мем:", randomGood);
      document.getElementById("success-meme").src = randomGood;
      successSound.play();
      setTimeout(nextWord, 1200); // через 1.2 сек переходим к следующему слову
      break;

    case "FAIL":
      failScreen.classList.add("active");
      const randomBad = badMemes[Math.floor(Math.random() * badMemes.length)];
      console.log("Выбранный BAD мем:", randomBad);
      document.getElementById("fail-meme").src = randomBad;
      failSound.play();
      setTimeout(nextWord, 1000); // через 1 сек переходим к следующему слову
      break;
  }
}

function nextWord() {
  currentWordIndex++;
  if (currentWordIndex >= words.length) {
    currentWordIndex = 0; // restart после последнего слова
  }
  setState("TASK");
}

// ===== Симуляция ответа без голоса =====
wordScreen.addEventListener("click", () => {
  if (gameState === "LISTENING") {
    clearInterval(timer);
    // случайно SUCCESS или FAIL (для теста)
    if (Math.random() > 0.5) {
      setState("SUCCESS");
    } else {
      setState("FAIL");
    }
  }
});

// ===== Запуск =====
bgMusic.play().catch(() => {
  // Автоплей в Chrome может блокироваться, включение через клик
});

setState("TASK");
