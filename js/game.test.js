// ABOUTME: Jest test suite for the Game class, focusing on board rendering functionality
// ABOUTME: Tests board creation, rendering, and basic game initialization following TDD principles

import { jest } from '@jest/globals';
import { Game } from './game.js';

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
  describe('Board Creation', () => {
    test('should create a Game instance', () => {
      const game = new Game();
      expect(game).toBeInstanceOf(Game);
    });

    test('should have a 5x4 board (5 ranks, 4 files)', () => {
      const game = new Game();
      const board = game.getBoard();
      
      expect(board).toHaveLength(5); // 5 ranks
      board.forEach(rank => {
        expect(rank).toHaveLength(4); // 4 files
      });
    });

    test('should have an empty board initially', () => {
      const game = new Game();
      const board = game.getBoard();
      
      for (let rank = 0; rank < 5; rank++) {
        for (let file = 0; file < 4; file++) {
          expect(board[rank][file]).toBeNull();
        }
      }
    });
  });

  describe('Game Initialization', () => {
    test('should initialize without errors', () => {
      const game = new Game();
      expect(() => game.initialize()).not.toThrow();
    });

    test('should find required DOM elements', () => {
      const game = new Game();
      game.initialize();
      
      // Should not throw error, meaning DOM elements were found
      expect(game.gameContainer).toBeTruthy();
      expect(game.boardElement).toBeTruthy();
      expect(game.statusElement).toBeTruthy();
      expect(game.controlsElement).toBeTruthy();
    });

    test('should throw error if DOM elements are missing', () => {
      document.body.innerHTML = ''; // Clear DOM
      const game = new Game();
      
      expect(() => game.initialize()).toThrow('Required DOM elements not found');
    });
  });

  describe('Board Rendering', () => {
    test('should render 20 squares for 4x5 board', () => {
      const game = new Game();
      game.initialize();
      
      const squares = document.querySelectorAll('.square');
      expect(squares).toHaveLength(20);
    });

    test('should add data attributes to squares', () => {
      const game = new Game();
      game.initialize();
      
      const squares = document.querySelectorAll('.square');
      squares.forEach(square => {
        expect(square.dataset.file).toBeDefined();
        expect(square.dataset.rank).toBeDefined();
        expect(parseInt(square.dataset.file)).toBeGreaterThanOrEqual(0);
        expect(parseInt(square.dataset.file)).toBeLessThanOrEqual(3);
        expect(parseInt(square.dataset.rank)).toBeGreaterThanOrEqual(0);
        expect(parseInt(square.dataset.rank)).toBeLessThanOrEqual(4);
      });
    });

    test('should add light/dark classes to squares', () => {
      const game = new Game();
      game.initialize();
      
      const squares = document.querySelectorAll('.square');
      squares.forEach(square => {
        expect(square.classList.contains('light') || square.classList.contains('dark')).toBe(true);
      });
    });

    test('should render file labels (a-d)', () => {
      const game = new Game();
      game.initialize();
      
      const fileLabels = document.querySelectorAll('.file-label');
      expect(fileLabels).toHaveLength(4);
      
      const expectedLabels = ['a', 'b', 'c', 'd'];
      fileLabels.forEach((label, index) => {
        expect(label.textContent).toBe(expectedLabels[index]);
      });
    });

    test('should render rank labels (1-5)', () => {
      const game = new Game();
      game.initialize();
      
      const rankLabels = document.querySelectorAll('.rank-label');
      expect(rankLabels).toHaveLength(5);
      
      const expectedLabels = ['5', '4', '3', '2', '1']; // Top to bottom
      rankLabels.forEach((label, index) => {
        expect(label.textContent).toBe(expectedLabels[index]);
      });
    });

    test('should make a1 square dark', () => {
      const game = new Game();
      game.initialize();
      
      const a1Square = document.querySelector('[data-file="0"][data-rank="0"]');
      expect(a1Square).toBeTruthy();
      expect(a1Square.classList.contains('dark')).toBe(true);
    });

    test('should alternate square colors correctly', () => {
      const game = new Game();
      game.initialize();
      
      // Check alternating pattern: (rank + file) % 2 === 1 should be light
      for (let rank = 0; rank < 5; rank++) {
        for (let file = 0; file < 4; file++) {
          const square = document.querySelector(`[data-file="${file}"][data-rank="${rank}"]`);
          const shouldBeLight = (rank + file) % 2 === 1;
          
          if (shouldBeLight) {
            expect(square.classList.contains('light')).toBe(true);
          } else {
            expect(square.classList.contains('dark')).toBe(true);
          }
        }
      }
    });
  });

  describe('Game Controls', () => {
    test('should render game control buttons', () => {
      const game = new Game();
      game.initialize();
      
      const newGameBtn = document.getElementById('new-game-btn');
      const resignBtn = document.getElementById('resign-btn');
      const hintBtn = document.getElementById('hint-btn');
      
      expect(newGameBtn).toBeTruthy();
      expect(resignBtn).toBeTruthy();
      expect(hintBtn).toBeTruthy();
    });

    test('should disable resign and hint buttons initially', () => {
      const game = new Game();
      game.initialize();
      
      const resignBtn = document.getElementById('resign-btn');
      const hintBtn = document.getElementById('hint-btn');
      
      expect(resignBtn.disabled).toBe(true);
      expect(hintBtn.disabled).toBe(true);
    });
  });
});