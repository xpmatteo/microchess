// ABOUTME: Jest test suite for controller AI integration using TDD approach
// ABOUTME: Tests controller functionality with AI player integration, hints, and automatic moves

import { jest } from '@jest/globals';
import { Controller } from './controller.js';
import { GameState } from './gameState.js';
import { AIPlayer } from './aiPlayer.js';
import { COLORS } from './constants.js';

// Mock View class
class MockView {
  constructor() {
    this.clickHandler = null;
    this.buttonHandlers = {};
    this.initialized = false;
    this.controlsEnabled = true;
  }

  setClickHandler(handler) {
    this.clickHandler = handler;
  }

  setButtonHandlers(handlers) {
    this.buttonHandlers = handlers;
  }

  initialize() {
    this.initialized = true;
  }

  clearHighlights() {}
  showSelectedPiece() {}
  showValidMoves() {}
  updateDisplay() {}
  updateStatus() {}
  showError() {}
  setControlsEnabled(enabled) {
    this.controlsEnabled = enabled;
  }
}

describe('Controller AI Integration', () => {
  let controller;
  let gameState;
  let mockView;
  let aiPlayer;

  beforeEach(() => {
    gameState = new GameState();
    mockView = new MockView();
    aiPlayer = new AIPlayer(COLORS.BLACK, 2);
    controller = new Controller(gameState, mockView, aiPlayer);
  });

  describe('Controller Constructor with AI', () => {
    test('should create controller with AI player', () => {
      expect(controller.getGameState()).toBe(gameState);
      expect(controller.getView()).toBe(mockView);
      expect(controller.getAIPlayer()).toBe(aiPlayer);
    });

    test('should work without AI player (human vs human)', () => {
      const humanController = new Controller(gameState, mockView);
      expect(humanController.getAIPlayer()).toBeNull();
    });
  });

  describe('AI Move Handling', () => {
    test('should trigger AI move after human move', async () => {
      controller.initialize();
      
      // Mock AI move
      const mockMove = { fromRank: 3, fromFile: 0, toRank: 2, toFile: 0 };
      jest.spyOn(aiPlayer, 'getMove').mockResolvedValue(mockMove);
      
      // Human makes a move (white)
      gameState.setCurrentTurn(COLORS.WHITE);
      const humanMove = { fromRank: 1, fromFile: 0, toRank: 2, toFile: 0 };
      gameState.executeMove(humanMove);
      
      // Should trigger AI move automatically
      await controller.handleAIMove();
      
      expect(aiPlayer.getMove).toHaveBeenCalled();
    });

    test('should not trigger AI move when not AI turn', async () => {
      controller.initialize();
      
      jest.spyOn(aiPlayer, 'getMove').mockResolvedValue(null);
      
      // Set to human turn
      gameState.setCurrentTurn(COLORS.WHITE);
      
      await controller.handleAIMove();
      
      expect(aiPlayer.getMove).toHaveBeenCalledWith(gameState);
    });

    test('should handle AI move execution', async () => {
      controller.initialize();
      
      const mockMove = { fromRank: 3, fromFile: 0, toRank: 2, toFile: 0 };
      jest.spyOn(aiPlayer, 'getMove').mockResolvedValue(mockMove);
      jest.spyOn(gameState, 'executeMove').mockReturnValue(true);
      
      gameState.setCurrentTurn(COLORS.BLACK);
      
      await controller.handleAIMove();
      
      expect(gameState.executeMove).toHaveBeenCalledWith(mockMove);
    });
  });

  describe('AI Hint Integration', () => {
    test('should provide hint using AI', async () => {
      controller.initialize();
      
      const mockHint = { fromRank: 1, fromFile: 0, toRank: 2, toFile: 0 };
      jest.spyOn(aiPlayer, 'getHint').mockResolvedValue(mockHint);
      jest.spyOn(mockView, 'showValidMoves');
      
      await controller.handleHint();
      
      expect(aiPlayer.getHint).toHaveBeenCalledWith(gameState);
      expect(mockView.showValidMoves).toHaveBeenCalledWith([mockHint]);
    });

    test('should handle hint when AI is null', async () => {
      const humanController = new Controller(gameState, mockView);
      humanController.initialize();
      
      jest.spyOn(mockView, 'updateStatus');
      
      await humanController.handleHint();
      
      expect(mockView.updateStatus).toHaveBeenCalledWith('Hint: AI not available');
    });
  });

  describe('AI Color Management', () => {
    test('should switch AI color for new game', () => {
      controller.initialize();
      
      expect(aiPlayer.getColor()).toBe(COLORS.BLACK);
      
      controller.handleNewGame();
      
      // AI should switch to white for next game
      expect(aiPlayer.getColor()).toBe(COLORS.WHITE);
    });

    test('should alternate AI colors correctly', () => {
      controller.initialize();
      
      // Game 1: AI is black
      expect(aiPlayer.getColor()).toBe(COLORS.BLACK);
      
      // Game 2: AI should be white
      controller.handleNewGame();
      expect(aiPlayer.getColor()).toBe(COLORS.WHITE);
      
      // Game 3: AI should be black again
      controller.handleNewGame();
      expect(aiPlayer.getColor()).toBe(COLORS.BLACK);
    });
  });

  describe('Game Flow with AI', () => {
    test('should disable controls during AI thinking', async () => {
      controller.initialize();
      
      const mockMove = { fromRank: 3, fromFile: 0, toRank: 2, toFile: 0 };
      jest.spyOn(aiPlayer, 'getMove').mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(mockMove), 100);
        });
      });
      
      jest.spyOn(mockView, 'setControlsEnabled');
      
      gameState.setCurrentTurn(COLORS.BLACK);
      
      const aiMovePromise = controller.handleAIMove();
      
      // Controls should be disabled during AI thinking
      expect(mockView.setControlsEnabled).toHaveBeenCalledWith(false);
      
      await aiMovePromise;
      
      // Controls should be re-enabled after AI move
      expect(mockView.setControlsEnabled).toHaveBeenCalledWith(true);
    });
  });
});