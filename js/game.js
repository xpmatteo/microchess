// ABOUTME: Main game class that manages the microchess game state and coordinates all game components
// ABOUTME: Handles initialization, board setup, and serves as the primary controller for the game

import { PIECE_SYMBOLS, INITIAL_POSITION } from './pieces.js';
import { GameState } from './gameState.js';

export class Game {
    constructor() {
        this.board = this.createEmptyBoard();
        this.gameContainer = null;
        this.boardElement = null;
        this.statusElement = null;
        this.controlsElement = null;
        this.gameState = null;
    }

    /**
     * Creates an empty 5x4 board (5 ranks, 4 files)
     * Board is indexed as board[rank][file] where rank 0 is rank 1 (white's back rank)
     */
    createEmptyBoard() {
        const board = [];
        for (let rank = 0; rank < 5; rank++) {
            board[rank] = [];
            for (let file = 0; file < 4; file++) {
                board[rank][file] = null;
            }
        }
        return board;
    }

    /**
     * Initialize the game
     */
    initialize() {
        try {
            // Get DOM elements
            this.gameContainer = document.getElementById('game-container');
            this.boardElement = document.getElementById('game-board');
            this.statusElement = document.getElementById('game-status');
            this.controlsElement = document.getElementById('game-controls');

            if (!this.gameContainer || !this.boardElement || !this.statusElement || !this.controlsElement) {
                throw new Error('Required DOM elements not found');
            }

            // Render the board
            this.renderBoard();

            // Set up initial position and render pieces
            this.setupInitialPosition();
            this.renderPieces();

            // Initialize GameState
            this.gameState = new GameState();
            
            // Set initial status
            this.updateGameStatus();
            
            // Add basic controls
            this.setupControls();

            console.log('Game initialized successfully');
            console.log('Board state:', this.board);
            
        } catch (error) {
            console.error('Error initializing game:', error);
            if (this.gameContainer) {
                this.gameContainer.innerHTML = '<div class="error">Error initializing game: ' + error.message + '</div>';
            }
            throw error;
        }
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

        // Add event listeners
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('resign-btn').addEventListener('click', () => {
            this.resign();
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.getHint();
        });
    }

    /**
     * Start a new game
     */
    newGame() {
        this.board = this.createEmptyBoard();
        this.setupInitialPosition();
        this.renderPieces();
        
        // Reset GameState
        if (this.gameState) {
            this.gameState = new GameState();
        }
        
        this.updateGameStatus();
        console.log('New game started');
    }

    /**
     * Handle resignation
     */
    resign() {
        this.statusElement.textContent = 'Game resigned';
        console.log('Game resigned');
    }

    /**
     * Get a hint for the current position
     */
    getHint() {
        this.statusElement.textContent = 'Hint: Feature not yet implemented';
        console.log('Hint requested');
    }

    /**
     * Get the current board state
     */
    getBoard() {
        return this.board;
    }

    /**
     * Get a piece at a specific position
     */
    getPieceAt(rank, file) {
        if (rank < 0 || rank >= 5 || file < 0 || file >= 4) {
            return null;
        }
        return this.board[rank][file];
    }

    /**
     * Set a piece at a specific position
     */
    setPieceAt(rank, file, piece) {
        if (rank < 0 || rank >= 5 || file < 0 || file >= 4) {
            return false;
        }
        this.board[rank][file] = piece;
        return true;
    }

    /**
     * Set up the initial microchess position
     */
    setupInitialPosition() {
        // Copy the initial position to the board
        for (let rank = 0; rank < 5; rank++) {
            for (let file = 0; file < 4; file++) {
                this.board[rank][file] = INITIAL_POSITION[rank][file];
            }
        }
    }

    /**
     * Render pieces on the board
     */
    renderPieces() {
        // Clear existing pieces
        const existingPieces = document.querySelectorAll('.square span[data-piece]');
        existingPieces.forEach(piece => piece.remove());

        // Render pieces from current board state
        for (let rank = 0; rank < 5; rank++) {
            for (let file = 0; file < 4; file++) {
                const piece = this.board[rank][file];
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
     * Execute a move using GameState
     */
    executeMove(move) {
        if (!this.gameState) {
            return false;
        }
        
        const result = this.gameState.executeMove(move);
        if (result) {
            // Update the visual board from GameState
            this.board = this.gameState.getBoard();
            this.renderPieces();
            this.updateGameStatus();
        }
        return result;
    }

    /**
     * Update game status display
     */
    updateGameStatus() {
        if (!this.gameState || !this.statusElement) {
            return;
        }
        
        const currentTurn = this.gameState.getCurrentTurn();
        const gameStatus = this.gameState.getGameStatus();
        
        if (gameStatus === 'checkmate') {
            const winner = currentTurn === 'white' ? 'Black' : 'White';
            this.statusElement.textContent = `Checkmate! ${winner} wins!`;
        } else if (gameStatus === 'stalemate') {
            this.statusElement.textContent = 'Stalemate! Draw!';
        } else if (gameStatus === 'resigned') {
            this.statusElement.textContent = 'Game resigned';
        } else {
            const turnText = currentTurn === 'white' ? 'White' : 'Black';
            this.statusElement.textContent = `${turnText} to move`;
        }
    }
}