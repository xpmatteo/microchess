// ABOUTME: Jest test suite for the Game class, focusing on dependency injection functionality
// ABOUTME: Tests game orchestration and MVC component coordination with constructor injection

import { jest } from '@jest/globals';
import { Game } from './game.js';
import { View } from './view.js';
import { Controller } from './controller.js';
import { GameState } from './gameState.js';
import { BOARD_RANKS, BOARD_FILES } from './constants.js';

// Mock DOM setup
beforeEach(() => {
  document.body.innerHTML = `
    <div id="game-container">
      <div id="game-board"></div>
      <div id="game-status"></div>
      <div id="game-controls"></div>
    </div>
  `;
});

describe('Game Class', () => {
  describe('Dependency Injection', () => {
    test('should create a Game instance', () => {
      const game = new Game();
      expect(game).toBeInstanceOf(Game);
    });

    test('should initialize controller successfully', () => {
      const game = new Game();
      expect(() => game.initialize()).not.toThrow();
      expect(game.controller).toBeDefined();
    });

    test('should have access to controller components', () => {
      const game = new Game();
      game.initialize();
      
      const controller = game.getController();
      expect(controller).toBeDefined();
      expect(controller.getGameState()).toBeDefined();
      expect(controller.getView()).toBeDefined();
    });

    test('should throw error when DOM elements are missing', () => {
      document.body.innerHTML = ''; // Remove DOM elements
      
      const game = new Game();
      expect(() => game.initialize()).toThrow('Required DOM elements not found');
    });

    test('should create board with proper structure through controller', () => {
      const game = new Game();
      game.initialize();
      
      const gameState = game.getController().getGameState();
      const board = gameState.getBoard();
      
      expect(board).toHaveLength(BOARD_RANKS); // 5 ranks
      board.forEach(rank => {
        expect(rank).toHaveLength(BOARD_FILES); // 4 files
      });
    });

    test('should render board elements in DOM', () => {
      const game = new Game();
      game.initialize();
      
      // Check that board squares were created
      const squares = document.querySelectorAll('.square');
      expect(squares).toHaveLength(BOARD_RANKS * BOARD_FILES); // 4x5 = 20 squares
      
      // Check that rank and file labels were created
      const rankLabels = document.querySelectorAll('.rank-label');
      const fileLabels = document.querySelectorAll('.file-label');
      expect(rankLabels).toHaveLength(BOARD_RANKS);
      expect(fileLabels).toHaveLength(BOARD_FILES);
    });

    test('should render initial pieces', () => {
      const game = new Game();
      game.initialize();
      
      // Should have pieces rendered on the board
      const pieces = document.querySelectorAll('.square span[data-piece]');
      expect(pieces.length).toBeGreaterThan(0);
    });

    test('should set up game controls', () => {
      const game = new Game();
      game.initialize();
      
      const newGameBtn = document.getElementById('new-game-btn');
      const resignBtn = document.getElementById('resign-btn');
      const hintBtn = document.getElementById('hint-btn');
      
      expect(newGameBtn).toBeTruthy();
      expect(resignBtn).toBeTruthy();
      expect(hintBtn).toBeTruthy();
    });

    test('should display initial game status', () => {
      const game = new Game();
      game.initialize();
      
      const statusElement = document.getElementById('game-status');
      expect(statusElement.textContent).toContain('White to move');
    });
  });

  describe('Dependency Injection Validation', () => {
    test('should properly inject dependencies through constructors', () => {
      const game = new Game();
      game.initialize();
      
      const controller = game.getController();
      const view = controller.getView();
      const gameState = controller.getGameState();
      
      // Verify dependencies were injected correctly
      expect(controller).toBeInstanceOf(Controller);
      expect(view).toBeInstanceOf(View);
      expect(gameState).toBeInstanceOf(GameState);
    });

    test('should allow testing components in isolation', () => {
      // Test View can be created with mock DOM elements
      const mockContainer = document.createElement('div');
      const mockBoard = document.createElement('div');
      const mockStatus = document.createElement('div');
      const mockControls = document.createElement('div');
      
      expect(() => new View(mockContainer, mockBoard, mockStatus, mockControls)).not.toThrow();
      
      // Test Controller can be created with mock dependencies
      const mockGameState = new GameState();
      const mockView = new View(mockContainer, mockBoard, mockStatus, mockControls);
      
      expect(() => new Controller(mockGameState, mockView)).not.toThrow();
    });

    test('should validate required dependencies', () => {
      // View should require all DOM elements
      expect(() => new View(null, null, null, null)).toThrow('All DOM elements must be provided');
      
      // Controller should require gameState and view
      expect(() => new Controller(null, null)).toThrow('GameState and View must be provided');
    });

    test('should handle new game without creating new dependencies', () => {
      const game = new Game();
      game.initialize();
      
      const controller = game.getController();
      const originalGameState = controller.getGameState();
      const originalView = controller.getView();
      
      // Simulate new game
      controller.handleNewGame();
      
      // Should still have the same instances (no new objects created)
      expect(controller.getGameState()).toBe(originalGameState);
      expect(controller.getView()).toBe(originalView);
      
      // But game state should be reset to initial values
      expect(originalGameState.getCurrentTurn()).toBe('white');
      expect(originalGameState.getGameStatus()).toBe('playing');
    });

    test('should maintain separation of concerns', () => {
      const game = new Game();
      game.initialize();
      
      const controller = game.getController();
      const view = controller.getView();
      const gameState = controller.getGameState();
      
      // Game should only orchestrate
      expect(typeof game.getController).toBe('function');
      
      // Controller should coordinate
      expect(typeof controller.handleSquareClick).toBe('function');
      expect(typeof controller.handleNewGame).toBe('function');
      
      // View should handle rendering
      expect(typeof view.renderPieces).toBe('function');
      expect(typeof view.updateStatus).toBe('function');
      
      // Model should handle game logic
      expect(typeof gameState.executeMove).toBe('function');
      expect(typeof gameState.getCurrentTurn).toBe('function');
    });
  });
});