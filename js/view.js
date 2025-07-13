// ABOUTME: View class that handles all DOM rendering and UI updates for the microchess game
// ABOUTME: Responsible for board display, piece rendering, visual feedback, and status updates

import { PIECE_SYMBOLS } from './pieces.js';

export class View {
    constructor(gameContainer, boardElement, statusElement, controlsElement) {
        if (!gameContainer || !boardElement || !statusElement || !controlsElement) {
            throw new Error('All DOM elements must be provided to View constructor');
        }
        
        this.gameContainer = gameContainer;
        this.boardElement = boardElement;
        this.statusElement = statusElement;
        this.controlsElement = controlsElement;
        this.clickHandler = null;
        this.buttonHandlers = null;
    }

    /**
     * Initialize the view rendering
     */
    initialize() {
        this.renderBoard();
        this.setupControls();
        this.attachButtonHandlers(); // Attach button handlers after controls are created
    }

    /**
     * Set the click handler for board interactions
     */
    setClickHandler(handler) {
        this.clickHandler = handler;
    }

    /**
     * Render the chess board as a 4x5 grid
     */
    renderBoard() {
        // Clear existing board
        this.boardElement.innerHTML = '';

        // Create board container
        const boardContainer = document.createElement('div');
        boardContainer.className = 'board-container';

        // Create rank labels (left side)
        const rankLabels = document.createElement('div');
        rankLabels.className = 'rank-labels';
        for (let rank = 4; rank >= 0; rank--) {
            const label = document.createElement('div');
            label.className = 'rank-label';
            label.textContent = (rank + 1).toString();
            rankLabels.appendChild(label);
        }

        // Create the actual board grid
        const boardGrid = document.createElement('div');
        boardGrid.className = 'board-grid';

        // Create squares (rank 4 at top, rank 0 at bottom)
        for (let rank = 4; rank >= 0; rank--) {
            for (let file = 0; file < 4; file++) {
                const square = document.createElement('div');
                square.className = 'square';
                
                // Add light/dark class - a1 should be dark
                const isLight = (rank + file) % 2 === 1;
                square.classList.add(isLight ? 'light' : 'dark');
                
                // Add data attributes for position
                square.dataset.file = file.toString();
                square.dataset.rank = rank.toString();
                
                // Add click handler
                square.addEventListener('click', (e) => {
                    if (this.clickHandler) {
                        // Find the square element (in case user clicked on a piece span)
                        const squareElement = e.target.closest('.square');
                        if (squareElement) {
                            this.clickHandler(parseInt(squareElement.dataset.rank), parseInt(squareElement.dataset.file));
                        }
                    }
                });
                
                boardGrid.appendChild(square);
            }
        }

        // Create file labels (bottom)
        const fileLabels = document.createElement('div');
        fileLabels.className = 'file-labels';
        for (let file = 0; file < 4; file++) {
            const label = document.createElement('div');
            label.className = 'file-label';
            label.textContent = String.fromCharCode(97 + file); // 'a', 'b', 'c', 'd'
            fileLabels.appendChild(label);
        }

        // Assemble the board
        const boardWithRanks = document.createElement('div');
        boardWithRanks.className = 'board-with-ranks';
        boardWithRanks.appendChild(rankLabels);
        boardWithRanks.appendChild(boardGrid);

        boardContainer.appendChild(boardWithRanks);
        boardContainer.appendChild(fileLabels);

        this.boardElement.appendChild(boardContainer);
    }

    /**
     * Setup basic game controls
     */
    setupControls() {
        this.controlsElement.innerHTML = `
            <button id="new-game-btn">New Game</button>
            <button id="resign-btn" disabled>Resign</button>
            <button id="hint-btn" disabled>Hint</button>
        `;
    }

    /**
     * Set button event handlers (store for later attachment)
     */
    setButtonHandlers(handlers) {
        this.buttonHandlers = handlers;
    }

    /**
     * Attach button event handlers (called after buttons are created)
     */
    attachButtonHandlers() {
        if (!this.buttonHandlers) return;

        const newGameBtn = document.getElementById('new-game-btn');
        const resignBtn = document.getElementById('resign-btn');
        const hintBtn = document.getElementById('hint-btn');

        if (newGameBtn && this.buttonHandlers.newGame) {
            newGameBtn.addEventListener('click', this.buttonHandlers.newGame);
        }
        if (resignBtn && this.buttonHandlers.resign) {
            resignBtn.addEventListener('click', this.buttonHandlers.resign);
        }
        if (hintBtn && this.buttonHandlers.hint) {
            hintBtn.addEventListener('click', this.buttonHandlers.hint);
        }
    }

    /**
     * Render pieces on the board from board state
     */
    renderPieces(board) {
        // Clear existing pieces
        const existingPieces = document.querySelectorAll('.square span[data-piece]');
        existingPieces.forEach(piece => piece.remove());

        // Render pieces from current board state
        for (let rank = 0; rank < 5; rank++) {
            for (let file = 0; file < 4; file++) {
                const piece = board[rank][file];
                if (piece !== null) {
                    const square = document.querySelector(`[data-file="${file}"][data-rank="${rank}"]`);
                    if (square) {
                        const pieceSpan = document.createElement('span');
                        pieceSpan.dataset.piece = piece.piece;
                        pieceSpan.dataset.color = piece.color;
                        pieceSpan.textContent = PIECE_SYMBOLS[piece.color][piece.piece];
                        square.appendChild(pieceSpan);
                    }
                }
            }
        }
    }

    /**
     * Update game status display
     */
    updateStatus(statusText) {
        if (this.statusElement) {
            this.statusElement.textContent = statusText;
        }
    }

    /**
     * Highlight a square (for selected piece or valid moves)
     */
    highlightSquare(rank, file, className = 'highlighted') {
        const square = document.querySelector(`[data-file="${file}"][data-rank="${rank}"]`);
        if (square) {
            square.classList.add(className);
        }
    }

    /**
     * Remove all highlights from the board
     */
    clearHighlights() {
        const highlightedSquares = document.querySelectorAll('.square.highlighted, .square.valid-move, .square.selected');
        highlightedSquares.forEach(square => {
            square.classList.remove('highlighted', 'valid-move', 'selected');
        });
    }

    /**
     * Highlight valid moves for a piece
     */
    showValidMoves(moves) {
        moves.forEach(move => {
            this.highlightSquare(move.toRank, move.toFile, 'valid-move');
        });
    }

    /**
     * Highlight the selected piece
     */
    showSelectedPiece(rank, file) {
        this.highlightSquare(rank, file, 'selected');
    }

    /**
     * Enable or disable game controls
     */
    setControlsEnabled(enabled) {
        const resignBtn = document.getElementById('resign-btn');
        const hintBtn = document.getElementById('hint-btn');

        if (resignBtn) {
            resignBtn.disabled = !enabled;
        }
        if (hintBtn) {
            hintBtn.disabled = !enabled;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.gameContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            this.gameContainer.prepend(errorDiv);
            
            // Remove error after 3 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 3000);
        }
    }
}