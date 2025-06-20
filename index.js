const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const winnerMessage = document.getElementById('winnerMessage');
const themeToggle = document.getElementById('themeToggle');
const modeSelector = document.getElementById('modeSelector');
const rewardAdBtn = document.getElementById('rewardAdBtn');

let currentPlayer = 'X';
let gameActive = false;
let board = ["", "", "", "", "", "", "", "", ""];
let mode = null;

const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

themeToggle.onclick = () => {
  document.body.classList.toggle('light');
};

setMode("twoPlayer"); // Default mode

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
modeSelector.addEventListener('change', (e) => {
  setMode(e.target.value);
});
rewardAdBtn.addEventListener('click', () => {
  onWatchRewardedAd();
});

function setMode(selectedMode) {
  mode = selectedMode;
  resetGame();
  gameActive = true;
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function resetGame() {
  board.fill("");
  currentPlayer = 'X';
  gameActive = true;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winner');
  });
  winnerMessage.classList.remove('show');
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWinner() {
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      gameActive = false;
      statusText.textContent = `Player ${board[a]} wins!`;
      cells[a].classList.add('winner');
      cells[b].classList.add('winner');
      cells[c].classList.add('winner');
      winnerMessage.textContent = `Player ${board[a]} Wins!`;
      winnerMessage.classList.add('show');

      // Show interstitial ad when game ends
      onLevelComplete();

      return true;
    }
  }
  if (!board.includes("")) {
    gameActive = false;
    statusText.textContent = "It's a draw!";
    winnerMessage.textContent = "It's a Draw!";
    winnerMessage.classList.add('show');

    // Show interstitial ad when game ends
    onLevelComplete();

    return true;
  }
  return false;
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (board[index] || !gameActive) return;

  if (mode === 'twoPlayer') {
    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;
    if (!checkWinner()) {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      statusText.textContent = `Player ${currentPlayer}'s turn`;
    }
  } else {
    board[index] = 'X';
    e.target.textContent = 'X';
    if (!checkWinner()) {
      currentPlayer = 'O';
      statusText.textContent = `Computer's turn`;
      setTimeout(() => {
        computerMove();
        if (!checkWinner()) {
          currentPlayer = 'X';
          statusText.textContent = `Player X's turn`;
        }
      }, 400);
    }
  }
}

function computerMove() {
  const empty = board.map((v, i) => v === "" ? i : null).filter(i => i !== null);
  if (mode === 'easy') {
    if (board[4] === "") {
      board[4] = 'O';
      cells[4].textContent = 'O';
      return;
    }
    const corners = [0, 2, 6, 8].filter(i => board[i] === "");
    if (corners.length) {
      const move = corners[Math.floor(Math.random() * corners.length)];
      board[move] = 'O';
      cells[move].textContent = 'O';
      return;
    }
    const move = empty[Math.floor(Math.random() * empty.length)];
    board[move] = 'O';
    cells[move].textContent = 'O';
  } else if (mode === 'medium') {
    // Step 1: Try to win
    for (let [a, b, c] of winPatterns) {
      const line = [board[a], board[b], board[c]];
      if (line.filter(v => v === 'O').length === 2 && line.includes("")) {
        const i = [a, b, c][line.indexOf("")];
        board[i] = 'O';
        cells[i].textContent = 'O';
        return;
      }
    }
    // Step 2: Block player's win
    for (let [a, b, c] of winPatterns) {
      const line = [board[a], board[b], board[c]];
      if (line.filter(v => v === 'X').length === 2 && line.includes("")) {
        const i = [a, b, c][line.indexOf("")];
        board[i] = 'O';
        cells[i].textContent = 'O';
        return;
      }
    }
    // Step 3: Take center
    if (board[4] === "") {
      board[4] = 'O';
      cells[4].textContent = 'O';
      return;
    }
    // Step 4: Take corner
    const corners = [0, 2, 6, 8].filter(i => board[i] === "");
    if (corners.length > 0) {
      const move = corners[Math.floor(Math.random() * corners.length)];
      board[move] = 'O';
      cells[move].textContent = 'O';
      return;
    }
    // Step 5: Random fallback
    const move = empty[Math.floor(Math.random() * empty.length)];
    board[move] = 'O';
    cells[move].textContent = 'O';
  } else if (mode === 'impossible') {
    const best = findBestMove(board.slice());
    board[best] = 'O';
    cells[best].textContent = 'O';
  }
}

function findBestMove(newBoard) {
  function minimax(board, depth, isMax) {
    const score = { X: -10, O: 10, tie: 0 };
    const result = checkMiniWinner(board);
    if (result !== null) return score[result];

    if (isMax) {
      let max = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = 'O';
          let s = minimax(board, depth + 1, false);
          board[i] = "";
          max = Math.max(max, s);
        }
      }
      return max;
    } else {
      let min = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = 'X';
          let s = minimax(board, depth + 1, true);
          board[i] = "";
          min = Math.min(min, s);
        }
      }
      return min;
    }
  }

  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (newBoard[i] === "") {
      newBoard[i] = 'O';
      let score = minimax(newBoard, 0, false);
      newBoard[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function checkMiniWinner(board) {
  for (let [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
  }
  if (!board.includes("")) return "tie";
  return null;
}

// AdMob Integration
document.addEventListener('deviceready', function () {
  admob.banner.config({
    id: 'ca-app-pub-8502216328443665/1346817163',
    isTesting: false,
    autoShow: true
  });
  admob.banner.prepare();

  admob.interstitial.config({
    id: 'ca-app-pub-8502216328443665/9033735495',
    isTesting: false,
    autoShow: false
  });
  admob.interstitial.prepare();

  admob.rewardvideo.config({
    id: 'ca-app-pub-8502216328443665/6407572152',
    isTesting: false,
    autoShow: false
  });
  admob.rewardvideo.prepare();

  // Reward event listener
  document.addEventListener('admob.rewardvideo.events.REWARD', function(event) {
    console.log('User rewarded:', event);
    // TODO: Add reward logic here, e.g. give a hint or extra move
    alert("Thanks for watching! Here's your reward.");
  });

}, false);

function onLevelComplete() {
  admob.interstitial.isReady(function(isReady){
    if (isReady) {
      admob.interstitial.show();
    }
  });
}
