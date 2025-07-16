// ABOUTME: Controller class that handles user interactions and coordinates between model and view
// ABOUTME: Manages game flow, user input events, and orchestrates updates between GameState and View

import { GAME_STATUS, COLORS, DISPLAY_NAMES } from './constants.js';

export class Controller {
    constructor(gameState, view, aiPlayer = null) {
        if (!gameState || !view) {
            throw new Error('GameState and View must be provided to Controller constructor');
        }
        
        this.gameState = gameState;
        this.view = view;
        this.aiPlayer = aiPlayer;
        this.selectedSquare = null; // {rank, file} or null
        this.isAIThinking = false;
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
            hint: () => this.handleHint(),
            testScenario: (e) => this.handleTestScenario(e)
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
     * Update piece selection and display highlights
     */
    updatePieceSelection(rank, file) {
        try {
            this.selectedSquare = { rank, file };
            this.view.clearHighlights();
            this.view.showSelectedPiece(rank, file);
            
            // Show valid moves for this piece
            const validMoves = this.gameState.getValidMovesForPiece(rank, file);
            this.view.showValidMoves(validMoves);
        } catch (error) {
            console.error('Error updating piece selection:', error.message);
            this.selectedSquare = null; // Clear invalid selection
            this.view.showError(`Error updating selection: ${error.message}`);
        }
    }

    /**
     * Try to select a square (if it contains a piece of the current player)
     */
    trySelectSquare(rank, file) {
        try {
            const piece = this.gameState.getPieceAt(rank, file);
            const currentTurn = this.gameState.getCurrentTurn();

            if (piece && piece.color === currentTurn) {
                this.updatePieceSelection(rank, file);
            }
        } catch (error) {
            console.error('Error selecting square:', error.message);
            this.view.showError(`Invalid position: ${error.message}`);
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
            } else if (this.aiPlayer) {
                // Trigger AI move after a short delay
                setTimeout(() => this.handleAIMove(), 200);
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
        // Switch AI color for next game
        if (this.aiPlayer) {
            const currentAIColor = this.aiPlayer.getColor();
            const newAIColor = currentAIColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
            this.aiPlayer.setColor(newAIColor);
        }

        // Reset the game state to initial position
        this.gameState.reset();
        this.deselectSquare();
        this.updateView();
        this.view.setControlsEnabled(true);
        console.log('New game started');

        // If AI is white, make the first move
        if (this.aiPlayer && this.aiPlayer.getColor() === COLORS.WHITE) {
            setTimeout(() => this.handleAIMove(), 100);
        }
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
    async handleHint() {
        if (!this.aiPlayer) {
            this.view.updateStatus('Hint: AI not available');
            console.log('Hint requested');
            return;
        }

        try {
            const hintMove = await this.aiPlayer.getHint(this.gameState);
            if (hintMove) {
                this.view.showValidMoves([hintMove]);
                this.view.updateStatus('Hint: Consider the highlighted move');
            } else {
                this.view.updateStatus('Hint: No good moves found');
            }
        } catch (error) {
            this.view.updateStatus('Hint: Error generating hint');
            console.error('Error generating hint:', error);
        }
        
        console.log('Hint requested');
    }

    /**
     * Handle test scenario selection
     */
    handleTestScenario(e) {
        const scenarioName = e.target.value;
        
        if (!scenarioName) {
            return; // Empty selection, do nothing
        }
        
        try {
            this.gameState.loadTestScenario(scenarioName);
            this.selectedSquare = null; // Clear selection
            this.updateView();
            this.view.setControlsEnabled(true);
            
            // Reset dropdown to empty selection
            e.target.value = '';
            
            console.log(`Loaded test scenario: ${scenarioName}`);
        } catch (error) {
            console.error('Error loading test scenario:', error);
            this.view.updateStatus(`Error: ${error.message}`);
        }
    }

    /**
     * Update the view based on current game state
     */
    updateView() {
        // Prepare display state object
        const displayState = {
            board: this.gameState.getBoard(),
            lastMove: this.gameState.getLastMove(),
            kingInCheck: this.gameState.getKingInCheck(),
            statusText: this.getStatusText()
        };
        
        // Add selected piece info if any
        if (this.selectedSquare) {
            try {
                const validMoves = this.gameState.getValidMovesForPiece(this.selectedSquare.rank, this.selectedSquare.file);
                displayState.selectedPiece = {
                    rank: this.selectedSquare.rank,
                    file: this.selectedSquare.file,
                    validMoves: validMoves
                };
            } catch (error) {
                console.error('Error getting valid moves for selected piece:', error.message);
                this.selectedSquare = null; // Clear invalid selection
                this.view.showError(`Error updating display: ${error.message}`);
            }
        }
        
        // Update view with consolidated state
        this.view.updateDisplay(displayState);
    }

    /**
     * Get status text based on game state
     */
    getStatusText() {
        const currentTurn = this.gameState.getCurrentTurn();
        const gameStatus = this.gameState.getGameStatus();
        
        if (gameStatus === GAME_STATUS.CHECKMATE) {
            const winner = currentTurn === COLORS.WHITE ? DISPLAY_NAMES.BLACK : DISPLAY_NAMES.WHITE;
            return `Checkmate! ${winner} wins!`;
        } else if (gameStatus === GAME_STATUS.STALEMATE) {
            return 'Stalemate! Draw!';
        } else if (gameStatus === GAME_STATUS.RESIGNED) {
            return 'Game resigned';
        } else {
            const turnText = currentTurn === COLORS.WHITE ? DISPLAY_NAMES.WHITE : DISPLAY_NAMES.BLACK;
            return `${turnText} to move`;
        }
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

    /**
     * Get the AI player (for external access)
     */
    getAIPlayer() {
        return this.aiPlayer;
    }

    /**
     * Handle AI move generation and execution
     */
    async handleAIMove() {
        if (!this.aiPlayer || this.isAIThinking) {
            return;
        }

        try {
            this.isAIThinking = true;
            this.view.setControlsEnabled(false);
            
            const aiMove = await this.aiPlayer.getMove(this.gameState);
            
            if (aiMove) {
                const success = this.gameState.executeMove(aiMove);
                
                if (success) {
                    this.updateView();
                    
                    // Check if game is over
                    const gameStatus = this.gameState.getGameStatus();
                    if (gameStatus === GAME_STATUS.CHECKMATE || gameStatus === GAME_STATUS.STALEMATE) {
                        this.view.setControlsEnabled(false);
                    } else {
                        this.view.setControlsEnabled(true);
                    }
                } else {
                    console.error('AI generated invalid move:', aiMove);
                    this.view.setControlsEnabled(true);
                }
            } else {
                // AI couldn't generate a move or it's not AI's turn
                this.view.setControlsEnabled(true);
            }
        } catch (error) {
            console.error('Error handling AI move:', error);
            this.view.setControlsEnabled(true);
        } finally {
            this.isAIThinking = false;
        }
    }
}