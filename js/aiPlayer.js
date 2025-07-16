// ABOUTME: AI player class for microchess with move generation, hints, and color switching
// ABOUTME: Handles AI gameplay with configurable search depth and realistic move delays

import { getBestMove } from './ai.js';
import { COLORS } from './constants.js';

export class AIPlayer {
    constructor(color, depth = 3) {
        this.validateColor(color);
        this.validateDepth(depth);
        
        this.color = color;
        this.depth = depth;
        this.minDelay = 500;  // Minimum delay in milliseconds
        this.maxDelay = 1500; // Maximum delay in milliseconds
        this.hintDepth = 2;   // Reduced depth for hints
    }

    /**
     * Validate color parameter
     */
    validateColor(color) {
        if (color !== COLORS.WHITE && color !== COLORS.BLACK) {
            throw new Error('Invalid color');
        }
    }

    /**
     * Validate depth parameter
     */
    validateDepth(depth) {
        if (typeof depth !== 'number' || depth < 1 || depth > 6) {
            throw new Error('Depth must be between 1 and 6');
        }
    }

    /**
     * Get AI player color
     */
    getColor() {
        return this.color;
    }

    /**
     * Set AI player color
     */
    setColor(color) {
        this.validateColor(color);
        this.color = color;
    }

    /**
     * Get AI search depth
     */
    getDepth() {
        return this.depth;
    }

    /**
     * Set AI search depth
     */
    setDepth(depth) {
        this.validateDepth(depth);
        this.depth = depth;
    }

    /**
     * Generate a move for the AI player
     * Returns null if it's not the AI's turn
     */
    async getMove(gameState) {
        const currentTurn = gameState.getCurrentTurn();
        
        // Return null if it's not AI's turn
        if (currentTurn !== this.color) {
            return null;
        }

        // Add realistic delay
        await this.addMoveDelay();

        // Get best move from AI
        const bestMove = getBestMove(gameState, this.depth);
        
        return bestMove;
    }

    /**
     * Generate a hint move for the current player
     */
    async getHint(gameState) {
        // Create a copy of the game state to avoid modifying the original
        const hintGameState = new (gameState.constructor)(gameState.getBoard());
        hintGameState.setCurrentTurn(gameState.getCurrentTurn());
        
        // Get best move using reduced depth for faster hint generation
        const hintMove = getBestMove(hintGameState, this.hintDepth);
        
        return hintMove;
    }

    /**
     * Add realistic delay to AI moves
     */
    async addMoveDelay() {
        // Random delay between min and max
        const delay = Math.random() * (this.maxDelay - this.minDelay) + this.minDelay;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}