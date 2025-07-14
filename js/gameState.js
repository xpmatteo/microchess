// ABOUTME: Game state management for microchess, handling move execution and game status
// ABOUTME: Tracks current turn, board state, move history, and check/checkmate detection

import { INITIAL_POSITION } from './pieces.js';
import { isValidMove, getPossibleMoves } from './moves.js';
import { GAME_STATUS, COLORS, BOARD_RANKS, BOARD_FILES } from './constants.js';

export class GameState {
    /**
     * Validate rank and file parameters
     * @param {number} rank - The rank (0-4)
     * @param {number} file - The file (0-3)
     * @throws {Error} - If parameters are invalid types, NaN, or out of bounds
     */
    validatePosition(rank, file) {
        // Validate parameter types
        if (typeof rank !== 'number' || typeof file !== 'number') {
            throw new Error(`Invalid parameter types: rank=${typeof rank}, file=${typeof file}. Both must be numbers.`);
        }
        
        // Validate for NaN
        if (isNaN(rank) || isNaN(file)) {
            throw new Error(`Invalid parameter values: rank=${rank}, file=${file}. Both must be valid numbers.`);
        }
        
        // Validate bounds
        if (rank < 0 || rank >= BOARD_RANKS || file < 0 || file >= BOARD_FILES) {
            throw new Error(`Position out of bounds: rank=${rank}, file=${file}. Valid range: rank(0-${BOARD_RANKS-1}), file(0-${BOARD_FILES-1}).`);
        }
    }
    constructor(board = null) {
        this.board = board ? this.copyBoard(board) : this.copyBoard(INITIAL_POSITION);
        this.currentTurn = COLORS.WHITE;
        this.gameStatus = GAME_STATUS.PLAYING;
        this.moveHistory = [];
    }

    /**
     * Deep copy a board
     */
    copyBoard(board) {
        return board.map(rank => rank.map(piece => piece ? { ...piece } : null));
    }

    /**
     * Get the current board state
     */
    getBoard() {
        return this.board;
    }

    /**
     * Get the current turn
     */
    getCurrentTurn() {
        return this.currentTurn;
    }

    /**
     * Set the current turn (for testing)
     */
    setCurrentTurn(color) {
        this.currentTurn = color;
    }

    /**
     * Get the current game status
     */
    getGameStatus() {
        // Update game status based on current position
        this.updateGameStatus();
        return this.gameStatus;
    }

    /**
     * Get piece at position
     * @param {number} rank - The rank (0-4)
     * @param {number} file - The file (0-3)
     * @returns {Object|null} - The piece object or null if empty/invalid
     * @throws {Error} - If parameters are invalid types
     */
    getPieceAt(rank, file) {
        this.validatePosition(rank, file);
        return this.board[rank][file];
    }

    /**
     * Set piece at position
     */
    setPieceAt(rank, file, piece) {
        try {
            this.validatePosition(rank, file);
            this.board[rank][file] = piece;
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Execute a move (supports both old and new format)
     */
    executeMove(move) {
        // Handle both {from, to} and {fromRank, fromFile, toRank, toFile} formats
        let from, to;
        if (move.from && move.to) {
            from = move.from;
            to = move.to;
        } else {
            from = { rank: move.fromRank, file: move.fromFile };
            to = { rank: move.toRank, file: move.toFile };
        }
        
        // Check if there's a piece at the source
        const piece = this.getPieceAt(from.rank, from.file);
        if (!piece) {
            return false;
        }

        // Check if it's the correct player's turn
        if (piece.color !== this.currentTurn) {
            return false;
        }

        // Check if the move is valid
        if (!isValidMove(this.board, from, to, piece.piece, piece.color)) {
            return false;
        }

        // Create a temporary board to test if move leaves king in check
        const tempBoard = this.copyBoard(this.board);
        tempBoard[to.rank][to.file] = tempBoard[from.rank][from.file];
        tempBoard[from.rank][from.file] = null;

        // Check if this move would leave own king in check
        const tempGameState = new GameState(tempBoard);
        if (tempGameState.isKingInCheck(this.currentTurn)) {
            return false;
        }

        // Execute the move
        const capturedPiece = this.board[to.rank][to.file];
        this.board[to.rank][to.file] = this.board[from.rank][from.file];
        this.board[from.rank][from.file] = null;

        // Add to move history
        this.moveHistory.push({
            from: { ...from },
            to: { ...to },
            piece: { ...piece },
            capturedPiece: capturedPiece ? { ...capturedPiece } : null
        });

        // Switch turns
        this.currentTurn = this.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

        return true;
    }

    /**
     * Check if a king is in check
     */
    isKingInCheck(color) {
        const kingPos = this.findKingPosition(color);
        if (!kingPos) {
            return false;
        }

        const oppositeColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

        // Check if any opponent piece can attack the king
        for (let rank = 0; rank < BOARD_RANKS; rank++) {
            for (let file = 0; file < BOARD_FILES; file++) {
                const piece = this.board[rank][file];
                if (piece && piece.color === oppositeColor) {
                    if (isValidMove(this.board, { rank, file }, kingPos, piece.piece, piece.color)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Find king position for a color
     */
    findKingPosition(color) {
        for (let rank = 0; rank < BOARD_RANKS; rank++) {
            for (let file = 0; file < BOARD_FILES; file++) {
                const piece = this.board[rank][file];
                if (piece && piece.piece === 'K' && piece.color === color) {
                    return { rank, file };
                }
            }
        }
        return null;
    }

    /**
     * Check if it's checkmate
     */
    isCheckmate(color) {
        // Must be in check first
        if (!this.isKingInCheck(color)) {
            return false;
        }

        // Check if any legal move exists
        return !this.hasLegalMoves(color);
    }

    /**
     * Check if it's stalemate
     */
    isStalemate(color) {
        // Must NOT be in check
        if (this.isKingInCheck(color)) {
            return false;
        }

        // Check if any legal move exists
        return !this.hasLegalMoves(color);
    }

    /**
     * Check if a color has any legal moves
     */
    hasLegalMoves(color) {
        for (let rank = 0; rank < BOARD_RANKS; rank++) {
            for (let file = 0; file < BOARD_FILES; file++) {
                const piece = this.board[rank][file];
                if (piece && piece.color === color) {
                    const possibleMoves = getPossibleMoves(this.board, { rank, file }, piece.piece, piece.color);
                    
                    // Check if any of these moves are legal (don't leave king in check)
                    for (const move of possibleMoves) {
                        const tempBoard = this.copyBoard(this.board);
                        tempBoard[move.rank][move.file] = tempBoard[rank][file];
                        tempBoard[rank][file] = null;
                        
                        const tempGameState = new GameState(tempBoard);
                        if (!tempGameState.isKingInCheck(color)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * Update game status based on current position
     */
    updateGameStatus() {
        // Don't override resigned status
        if (this.gameStatus === GAME_STATUS.RESIGNED) {
            return;
        }
        
        if (this.isCheckmate(this.currentTurn)) {
            this.gameStatus = GAME_STATUS.CHECKMATE;
        } else if (this.isStalemate(this.currentTurn)) {
            this.gameStatus = GAME_STATUS.STALEMATE;
        } else {
            this.gameStatus = GAME_STATUS.PLAYING;
        }
    }

    /**
     * Get move history
     */
    getMoveHistory() {
        return [...this.moveHistory];
    }

    /**
     * Undo the last move
     */
    undoLastMove() {
        if (this.moveHistory.length === 0) {
            return false;
        }

        const lastMove = this.moveHistory.pop();
        
        // Restore the board state
        this.board[lastMove.from.rank][lastMove.from.file] = lastMove.piece;
        this.board[lastMove.to.rank][lastMove.to.file] = lastMove.capturedPiece;

        // Switch turns back
        this.currentTurn = this.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

        return true;
    }

    /**
     * Get valid moves for a piece at a specific position
     * @param {number} rank - The rank (0-4) 
     * @param {number} file - The file (0-3)
     * @returns {Array} - Array of valid move objects, empty if no valid moves
     * @throws {Error} - If parameters are invalid or position is out of bounds
     */
    getValidMovesForPiece(rank, file) {
        // Validate parameters and get piece (throws on invalid input)
        const piece = this.getPieceAt(rank, file);
        
        // Return empty array if no piece or wrong turn (not an error)
        if (!piece || piece.color !== this.currentTurn) {
            return [];
        }

        const possibleMoves = getPossibleMoves(this.board, { rank, file }, piece.piece, piece.color);
        const validMoves = [];

        // Filter out moves that would leave the king in check
        for (const move of possibleMoves) {
            const tempBoard = this.copyBoard(this.board);
            tempBoard[move.rank][move.file] = tempBoard[rank][file];
            tempBoard[rank][file] = null;
            
            const tempGameState = new GameState(tempBoard);
            if (!tempGameState.isKingInCheck(this.currentTurn)) {
                validMoves.push({
                    fromRank: rank,
                    fromFile: file,
                    toRank: move.rank,
                    toFile: move.file
                });
            }
        }

        return validMoves;
    }

    /**
     * Resign the game
     */
    resign() {
        this.gameStatus = GAME_STATUS.RESIGNED;
    }

    /**
     * Reset the game to initial state
     */
    reset() {
        this.board = this.copyBoard(INITIAL_POSITION);
        this.currentTurn = COLORS.WHITE;
        this.gameStatus = GAME_STATUS.PLAYING;
        this.moveHistory = [];
    }

    /**
     * Get the last move made (for visual feedback)
     */
    getLastMove() {
        if (this.moveHistory.length === 0) {
            return null;
        }
        return this.moveHistory[this.moveHistory.length - 1];
    }

    /**
     * Get king position if current player is in check (for visual feedback)
     */
    getKingInCheck() {
        if (this.isKingInCheck(this.currentTurn)) {
            return this.findKingPosition(this.currentTurn);
        }
        return null;
    }
}