// create game grid
const size = 4;
let grid = [];
let score = 0;
let history = [];
let isGameOver = false;

const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");
const gameOverModal = document.getElementById("gameOverModal");
const leaderboardModal = document.getElementById("leaderboardModal");

//init
function init() {
  const saved = localStorage.getItem("gameState");
  if (saved) {
    const data = JSON.parse(saved);
    grid = data.grid;
    score = data.score;
    isGameOver = data.isGameOver;
  } else {
    startNewGame();
  }
  render();
}

function startNewGame() {
  grid = Array.from({ length: size }, () => Array(size).fill(0));
  score = 0;
  history = [];
  isGameOver = false;
  addRandomTile();
  addRandomTile();
  saveGame();
  render();
}

//display tiles on grid
function render() {
  gridElement.innerHTML = "";
  grid.forEach(row => {
    row.forEach(cell => {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      if (cell !== 0) {
        tile.textContent = cell;
        tile.classList.add(`tile-${cell}`);
      }
      gridElement.appendChild(tile);
    });
  });
  scoreElement.textContent = score;
}

//add rand tile
function addRandomTile() {
  const empty = [];
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell === 0) empty.push({ r, c });
    })
  );
  if (!empty.length) return;
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

//process a move
function move(direction) {
  if (isGameOver) return;

  const oldGrid = JSON.stringify(grid);
  history.push({ grid: JSON.parse(oldGrid), score });

  for (let i = 0; i < size; i++) {
    let row = getRow(i, direction);
    let merged = merge(row);
    setRow(i, merged.row, direction);
    score += merged.score;
  }

  if (JSON.stringify(grid) !== oldGrid) {
    addRandomTile();
    if (Math.random() < 0.5) addRandomTile();
  }

  if (checkGameOver()) {
    isGameOver = true;
    resetGameOverModal();
    gameOverModal.classList.remove("hidden");
  }

  saveGame();
  render();
}

//join 2 tiles
function merge(row) {
  row = row.filter(n => n !== 0);
  let points = 0;
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] === row[i + 1]) {
      row[i] *= 2;
      points += row[i];
      row[i + 1] = 0;
    }
  }
  row = row.filter(n => n !== 0);
  while (row.length < size) row.push(0);
  return { row, score: points };
}

function getRow(i, dir) {
  if (dir === "left") return [...grid[i]];
  if (dir === "right") return [...grid[i]].reverse();
  if (dir === "up") return grid.map(r => r[i]);
  if (dir === "down") return grid.map(r => r[i]).reverse();
}

function setRow(i, row, dir) {
  if (dir === "left") grid[i] = row;
  if (dir === "right") grid[i] = row.reverse();
  if (dir === "up") row.forEach((v, idx) => grid[idx][i] = v);
  if (dir === "down") row.reverse().forEach((v, idx) => grid[idx][i] = v);
}

function checkGameOver() {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) return false;
      if (c < size - 1 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < size - 1 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

function undo() {
  if (!history.length || isGameOver) return;
  const prev = history.pop();
  grid = prev.grid;
  score = prev.score;
  render();
  saveGame();
}

function saveGame() {
  localStorage.setItem("gameState", JSON.stringify({ grid, score, isGameOver }));
}

//get key presses
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (key === "arrowleft" || key === "a") move("left");
  if (key === "arrowright" || key === "d") move("right");
  if (key === "arrowup" || key === "w") move("up");
  if (key === "arrowdown" || key === "s") move("down");
});

//buttons
document.querySelectorAll(".controls button").forEach(btn => {
  btn.addEventListener("click", () => move(btn.dataset.dir));
});

document.getElementById("restartBtn").onclick = startNewGame;
document.getElementById("undoBtn").onclick = undo;

document.getElementById("leaderboardBtn").onclick = () => {
  loadLeaderboard();
  leaderboardModal.classList.remove("hidden");
};

document.getElementById("closeLeaderboardBtn").onclick = () => {
  leaderboardModal.classList.add("hidden");
};

// sav e score
document.getElementById("saveScoreBtn").onclick = () => {
  const name = document.getElementById("playerName").value.trim();
  let records = JSON.parse(localStorage.getItem("leaderboard")) || [];
  records.push({ name, score, date: new Date().toLocaleDateString() });
  records.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(records.slice(0, 10)));
  document.getElementById("gameOverText").textContent = "Score saved!";
  document.getElementById("playerName").style.display = "none";
  document.getElementById("saveScoreBtn").style.display = "none";
};

// new game btn
document.getElementById("newGameBtn").onclick = () => {
  gameOverModal.classList.add("hidden");
  resetGameOverModal();
  startNewGame();
};

// загурзсть лидерборд
function loadLeaderboard() {
  const records = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const tbody = document.getElementById("leaderboardBody");
  tbody.innerHTML = "";
  records.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.name}</td><td>${r.score}</td><td>${r.date}</td>`;
    tbody.appendChild(tr);
  });
}

function resetGameOverModal() {
  document.getElementById("gameOverText").textContent = "Game Over!";
  document.getElementById("playerName").value = "";
  document.getElementById("playerName").style.display = "block";
  document.getElementById("saveScoreBtn").style.display = "inline-block";
}

init();