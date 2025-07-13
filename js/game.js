// ABOUTME: Main game orchestrator that creates and injects MVC dependencies
// ABOUTME: Factory class that handles dependency injection and initialization errors

import { Controller } from './controller.js';
import { View } from './view.js';
import { GameState } from './gameState.js';

export class Game {
    constructor() {
        this.controller = null;
    }

    /**
     * Initialize the game using dependency injection pattern
     */
    initialize() {
        try {
            // Get DOM elements
            const gameContainer = document.getElementById('game-container');
            const boardElement = document.getElementById('game-board');
            const statusElement = document.getElementById('game-status');
            const controlsElement = document.getElementById('game-controls');

            if (!gameContainer || !boardElement || !statusElement || !controlsElement) {
                throw new Error('Required DOM elements not found');
            }

            // Create dependencies
            const gameState = new GameState();
            const view = new View(gameContainer, boardElement, statusElement, controlsElement);
            
            // Inject dependencies into controller
            this.controller = new Controller(gameState, view);
            this.controller.initialize();
            
            console.log('Microchess game initialized successfully with dependency injection');
            
        } catch (error) {
            console.error('Error initializing game:', error);
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.innerHTML = '<div class="error">Error initializing game: ' + error.message + '</div>';
            }
            throw error;
        }
    }

    /**
     * Get the controller (for external access if needed)
     */
    getController() {
        return this.controller;
    }
}