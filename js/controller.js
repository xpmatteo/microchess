// ABOUTME: Controller class that handles user interactions and coordinates between model and view
// ABOUTME: Manages game flow, user input events, and orchestrates updates between GameState and View

import { GAME_STATUS, COLORS, DISPLAY_NAMES } from './constants.js';

export class Controller {
    constructor(gameState, view) {
        if (!gameState || !view) {
            throw new Error('GameState and View must be provided to Controller constructor');
        }
        
        this.gameState = gameState;
        this.view = view;
        this.selectedSquare = null; // {rank, file} or null
    }

    /**
     * Initialize the controller event handlers and initial rendering
     */
    initialize() {
        // Set up event handlers BEFORE initializing the view
        this.view.setClickHandler((rank, file) => this.handleSquareClick(rank, file));
        this.view.setButtonHandlers({
            newGame: () => this.handleNewGame(),
            resign: () => this.handleResign(),
            hint: () => this.handleHint()
        });
        
        // Initialize the view
        this.view.initialize();

        // Initial render
        this.updateView();
        this.view.setControlsEnabled(true);
    }

    /**
     * Handle square click events
     */
    handleSquareClick(rank, file) {
        // If no square is selected, try to select this one
        if (!this.selectedSquare) {
            this.trySelectSquare(rank, file);
        } else {
            // If the same square is clicked, deselect
            if (this.selectedSquare.rank === rank && this.selectedSquare.file === file) {
                this.deselectSquare();
            } else {
                // Try to move to the clicked square
                this.tryMakeMove(this.selectedSquare.rank, this.selectedSquare.file, rank, file);
            }
        }
    }

    /**
     * Try to select a square (if it contains a piece of the current player)
     */
    trySelectSquare(rank, file) {
        const piece = this.gameState.getPieceAt(rank, file);
        const currentTurn = this.gameState.getCurrentTurn();

        if (piece && piece.color === currentTurn) {
            this.selectedSquare = { rank, file };
            this.view.clearHighlights();
            this.view.showSelectedPiece(rank, file);
            
            // Show valid moves for this piece
            const validMoves = this.gameState.getValidMovesForPiece(rank, file);
            this.view.showValidMoves(validMoves);
        }
    }

    /**
     * Deselect the currently selected square
     */
    deselectSquare() {
        this.selectedSquare = null;
        this.view.clearHighlights();
    }

    /**
     * Try to make a move from one square to another
     */
    tryMakeMove(fromRank, fromFile, toRank, toFile) {
        const move = {
            fromRank,
            fromFile,
            toRank,
            toFile
        };

        const success = this.gameState.executeMove(move);
        
        if (success) {
            // Move was successful
            this.deselectSquare();
            this.updateView();
            
            // Check if game is over
            const gameStatus = this.gameState.getGameStatus();
            if (gameStatus === GAME_STATUS.CHECKMATE || gameStatus === GAME_STATUS.STALEMATE) {
                this.view.setControlsEnabled(false);
            }
        } else {
            // Invalid move - try to select the target square instead
            this.deselectSquare();
            this.trySelectSquare(toRank, toFile);
        }
    }

    /**
     * Handle new game button
     */
    handleNewGame() {
        // Reset the game state to initial position
        this.gameState.reset();
        this.deselectSquare();
        this.updateView();
        this.view.setControlsEnabled(true);
        console.log('New game started');
    }

    /**
     * Handle resign button
     */
    handleResign() {
        this.gameState.resign();
        this.deselectSquare();
        this.updateView();
        this.view.setControlsEnabled(false);
        console.log('Game resigned');
    }

    /**
     * Handle hint button
     */
    handleHint() {
        // Placeholder for AI hint functionality
        this.view.updateStatus('Hint: Feature not yet implemented');
        console.log('Hint requested');
    }

    /**
     * Update the view based on current game state
     */
    updateView() {
        // Clear existing highlights (except selected piece and valid moves)
        this.view.clearHighlights();
        
        // Re-show selected piece if any
        if (this.selectedSquare) {
            this.view.showSelectedPiece(this.selectedSquare.rank, this.selectedSquare.file);
            const validMoves = this.gameState.getValidMovesForPiece(this.selectedSquare.rank, this.selectedSquare.file);
            this.view.showValidMoves(validMoves);
        }
        
        // Show last move
        const lastMove = this.gameState.getLastMove();
        if (lastMove) {
            this.view.showLastMove(lastMove.from.rank, lastMove.from.file, lastMove.to.rank, lastMove.to.file);
        }
        
        // Show check warning
        const kingInCheck = this.gameState.getKingInCheck();
        if (kingInCheck) {
            this.view.showCheckWarning(kingInCheck.rank, kingInCheck.file);
        }
        
        // Update board display
        this.view.renderPieces(this.gameState.getBoard());
        
        // Update status
        this.updateStatus();
    }

    /**
     * Update status display based on game state
     */
    updateStatus() {
        const currentTurn = this.gameState.getCurrentTurn();
        const gameStatus = this.gameState.getGameStatus();
        
        let statusText;
        if (gameStatus === GAME_STATUS.CHECKMATE) {
            const winner = currentTurn === COLORS.WHITE ? DISPLAY_NAMES.BLACK : DISPLAY_NAMES.WHITE;
            statusText = `Checkmate! ${winner} wins!`;
        } else if (gameStatus === GAME_STATUS.STALEMATE) {
            statusText = 'Stalemate! Draw!';
        } else if (gameStatus === GAME_STATUS.RESIGNED) {
            statusText = 'Game resigned';
        } else {
            const turnText = currentTurn === COLORS.WHITE ? DISPLAY_NAMES.WHITE : DISPLAY_NAMES.BLACK;
            statusText = `${turnText} to move`;
        }
        
        this.view.updateStatus(statusText);
    }

    /**
     * Get the current game state (for external access)
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * Get the view (for external access)
     */
    getView() {
        return this.view;
    }
}