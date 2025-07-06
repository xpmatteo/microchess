// ABOUTME: Main game class that manages the microchess game state and coordinates all game components
// ABOUTME: Handles initialization, board setup, and serves as the primary controller for the game

export class Game {
    constructor() {
        this.board = this.createEmptyBoard();
        this.gameContainer = null;
        this.boardElement = null;
        this.statusElement = null;
        this.controlsElement = null;
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

            // Set initial status
            this.statusElement.textContent = 'Game initialized - Ready to start';
            
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
        this.statusElement.textContent = 'New game started - Setting up board...';
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
}