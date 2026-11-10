
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

    <button id="restart">Restart Game</button>
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
        cell.textContent = pieces[
          piece.color + piece.type
        ]
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
    try {
      game.move({
        from: selectedSquare,
        to: square,
        promotion: 'q'
      })

      selectedSquare = null
      legalTargets = []
      renderBoard()
      return
    } catch {
      // Ignore invalid moves
    }
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

document.querySelector('#restart').addEventListener('click', () => {
  game.reset()
  selectedSquare = null
  legalTargets = []
  renderBoard()
})

renderBoard()
