// ================= ELEMENTS =================
const board = document.getElementById("gameBoard");
const movesText = document.getElementById("moves");
const timerText = document.getElementById("timer");
const result = document.getElementById("result");
const bestScoreText = document.getElementById("bestScore");

const toggle = document.getElementById("themeToggle");
const restartBtn = document.getElementById("restartBtn");
const body = document.body;

// ================= DATA =================
const symbols = [
  "🍎","🍎","🚀","🚀","🎧","🎧","🐱","🐱",
  "🔥","🔥","🌟","🌟","🍕","🍕","⚡","⚡"
];

let cards = [];
let flipped = [];
let moves = 0;
let time = 0;
let timer;
let timerStarted = false;

// ================= THEME =================
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  body.classList.add("dark");
  toggle.checked = true;
}

toggle.addEventListener("change", () => {
  body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    body.classList.contains("dark") ? "dark" : "light"
  );
});

// ================= START GAME =================
function startGame() {
  board.innerHTML = "";
  cards = [...symbols].sort(() => 0.5 - Math.random());
  flipped = [];
  moves = 0;
  time = 0;
  timerStarted = false;

  movesText.textContent = "Moves: 0";
  timerText.textContent = "Time: 0s";
  result.textContent = "";

  clearInterval(timer);

  // CREATE CARDS
  cards.forEach(symbol => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="front"></div>
      <div class="back">${symbol}</div>
    `;

    card.addEventListener("click", () => flipCard(card, symbol));
    board.appendChild(card);
  });

  showHistory();
}

// ================= FLIP CARD =================
function flipCard(card, symbol) {
  if (card.classList.contains("flip") || flipped.length === 2) return;

  // START TIMER ON FIRST CLICK
  if (!timerStarted) {
    timerStarted = true;

    timer = setInterval(() => {
      time++;
      timerText.textContent = "Time: " + time + "s";
    }, 1000);
  }

  // CLICK EFFECT
  card.style.transform = "scale(0.95)";
  setTimeout(() => (card.style.transform = ""), 100);

  card.classList.add("flip");
  flipped.push({ card, symbol });

  if (flipped.length === 2) {
    moves++;
    movesText.textContent = "Moves: " + moves;

    setTimeout(checkMatch, 900);
  }
}

// ================= CHECK MATCH =================
function checkMatch() {
  const [a, b] = flipped;

  if (a.symbol !== b.symbol) {
    a.card.classList.remove("flip");
    b.card.classList.remove("flip");
  }

  flipped = [];
  checkWin();
}

// ================= CHECK WIN =================
function checkWin() {
  const all = document.querySelectorAll(".flip").length;

  if (all === cards.length) {
    clearInterval(timer);

    result.innerHTML = `
      🎉 <br>
      <strong>You Won!</strong><br>
      Moves: ${moves} <br>
      Time: ${time}s
    `;

    // ===== SAVE HISTORY =====
    let history = JSON.parse(localStorage.getItem("history")) || [];

    history.push({
      moves: moves,
      time: time,
      date: new Date().toLocaleString()
    });

    // LIMIT STORAGE
    if (history.length > 20) history.shift();

    localStorage.setItem("history", JSON.stringify(history));

    // ===== BEST SCORE =====
    const best = localStorage.getItem("bestScore");

    if (!best || moves < best) {
      localStorage.setItem("bestScore", moves);
    }

    showHistory();
  }
}

// ================= SHOW HISTORY =================
function showHistory() {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  const best = localStorage.getItem("bestScore");

  let html = "";

  if (best) {
    html += `<p><strong>Best Score:</strong> ${best} moves</p>`;
  }

  html += "<h3>Last 5 Games</h3>";

  history.slice(-5).reverse().forEach(game => {
    html += `
      <p>Moves: ${game.moves} | Time: ${game.time}s</p>
    `;
  });

  bestScoreText.innerHTML = html;
}

// ================= RESTART =================
restartBtn.addEventListener("click", () => {
  board.style.opacity = "0";

  setTimeout(() => {
    board.style.opacity = "1";
    startGame();
  }, 200);
});

// ================= INIT =================
startGame();