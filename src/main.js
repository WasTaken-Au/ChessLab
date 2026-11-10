
import './style.css'
import { Chess } from 'chess.js'

const game = new Chess()

let selectedSquare = null
let legalTargets = []

const pieces = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟'
}

document.querySelector('#app').innerHTML = `
  <main class="container">
    <h1>ChessLab</h1>
    <p class="subtitle">Player vs Bot Chess Platform</p>

    <div id="status">White to move</div>
    <div id="board"></div>

    <div class="game-controls">
      <button id="undo">Undo Move</button>
      <button id="restart">Restart Game</button>
    </div>

    <section class="game-info">
      <div class="panel">
        <h3>Move History</h3>
        <div id="history"></div>
      </div>

      <div class="panel">
        <h3>Captured Pieces</h3>
        <p>White captured: <span id="white-captured">None</span></p>
        <p>Black captured: <span id="black-captured">None</span></p>
      </div>
    </section>
  </main>
`

const boardElement = document.querySelector('#board')
const statusElement = document.querySelector('#status')

function renderBoard() {
  const board = game.board()
  boardElement.innerHTML = ''

  board.forEach((rank, row) => {
    rank.forEach((piece, col) => {
      const square = String.fromCharCode(97 + col) + (8 - row)
      const cell = document.createElement('button')

      cell.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`
      cell.dataset.square = square

      if (piece) {
        cell.textContent = pieces[piece.color + piece.type]
      }

      if (square === selectedSquare) {
        cell.classList.add('selected')
      }

      if (legalTargets.includes(square)) {
        cell.classList.add('legal')
      }

      cell.addEventListener('click', () => handleSquareClick(square))
      boardElement.appendChild(cell)
    })
  })

  updateStatus()
  updateHistory()
  updateCapturedPieces()
}

function updateStatus() {
  if (game.isCheckmate()) {
    statusElement.textContent =
      `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`
  } else if (game.isDraw()) {
    statusElement.textContent = 'Draw!'
  } else {
    statusElement.textContent =
      `${game.turn() === 'w' ? 'White' : 'Black'} to move` +
      (game.isCheck() ? ' — Check!' : '')
  }
}

function handleSquareClick(square) {
  if (game.isGameOver()) return

  if (selectedSquare && legalTargets.includes(square)) {
    game.move({
      from: selectedSquare,
      to: square,
      promotion: 'q'
    })

    selectedSquare = null
    legalTargets = []
    renderBoard()
    return
  }

  const piece = game.get(square)

  if (piece && piece.color === game.turn()) {
    selectedSquare = square
    legalTargets = game.moves({
      square,
      verbose: true
    }).map(move => move.to)
  } else {
    selectedSquare = null
    legalTargets = []
  }

  renderBoard()
}

function updateHistory() {
  const history = game.history()
  const element = document.querySelector('#history')

  if (history.length === 0) {
    element.textContent = 'No moves yet.'
    return
  }

  element.innerHTML = ''

  for (let i = 0; i < history.length; i += 2) {
    const row = document.createElement('div')
    row.className = 'history-row'

    const number = document.createElement('span')
    number.textContent = `${Math.floor(i / 2) + 1}.`

    const white = document.createElement('span')
    white.textContent = history[i]

    const black = document.createElement('span')
    black.textContent = history[i + 1] || ''

    row.append(number, white, black)
    element.appendChild(row)
  }
}

function updateCapturedPieces() {
  const history = game.history({ verbose: true })

  const whiteCaptured = []
  const blackCaptured = []

  history.forEach(move => {
    if (move.captured) {
      const capturedSymbol = pieces[
        (move.color === 'w' ? 'b' : 'w') + move.captured
      ]

      if (move.color === 'w') {
        whiteCaptured.push(capturedSymbol)
      } else {
        blackCaptured.push(capturedSymbol)
      }
    }
  })

  document.querySelector('#white-captured').textContent =
    whiteCaptured.join(' ') || 'None'

  document.querySelector('#black-captured').textContent =
    blackCaptured.join(' ') || 'None'
}

document.querySelector('#undo').addEventListener('click', () => {
  game.undo()
  selectedSquare = null
  legalTargets = []
  renderBoard()
})

document.querySelector('#restart').addEventListener('click', () => {
  game.reset()
  selectedSquare = null
  legalTargets = []
  renderBoard()
})

renderBoard()
