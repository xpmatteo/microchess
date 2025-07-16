// ABOUTME: Jest test suite for AI player integration using TDD approach
// ABOUTME: Tests AI player functionality, hints, delays, and color switching

import { jest } from '@jest/globals';
import { AIPlayer } from './aiPlayer.js';
import { GameState } from './gameState.js';
import { COLORS } from './constants.js';

describe('AI Player Integration', () => {
  let gameState;
  let aiPlayer;

  beforeEach(() => {
    gameState = new GameState();
    aiPlayer = new AIPlayer(COLORS.BLACK, 2); // AI plays black, depth 2
  });

  describe('AI Player Constructor', () => {
    test('should create AI player with correct color and depth', () => {
      expect(aiPlayer.getColor()).toBe(COLORS.BLACK);
      expect(aiPlayer.getDepth()).toBe(2);
    });

    test('should default to depth 3 if not specified', () => {
      const defaultAI = new AIPlayer(COLORS.WHITE);
      expect(defaultAI.getDepth()).toBe(3);
    });

    test('should throw error for invalid color', () => {
      expect(() => new AIPlayer('invalid')).toThrow('Invalid color');
    });
  });

  describe('AI Move Generation', () => {
    test('should return a valid move when it is AI turn', async () => {
      // Set up game state where black (AI) should move
      gameState.setCurrentTurn(COLORS.BLACK);
      
      const move = await aiPlayer.getMove(gameState);
      
      expect(move).toBeDefined();
      expect(move).toHaveProperty('fromRank');
      expect(move).toHaveProperty('fromFile');
      expect(move).toHaveProperty('toRank');
      expect(move).toHaveProperty('toFile');
      expect(typeof move.fromRank).toBe('number');
      expect(typeof move.fromFile).toBe('number');
      expect(typeof move.toRank).toBe('number');
      expect(typeof move.toFile).toBe('number');
    });

    test('should return null when not AI turn', async () => {
      // Set up game state where white (human) should move
      gameState.setCurrentTurn(COLORS.WHITE);
      
      const move = await aiPlayer.getMove(gameState);
      
      expect(move).toBeNull();
    });

    test('should respect minimum move delay', async () => {
      gameState.setCurrentTurn(COLORS.BLACK);
      
      const startTime = Date.now();
      await aiPlayer.getMove(gameState);
      const endTime = Date.now();
      
      // Should take at least 500ms (minimum delay)
      expect(endTime - startTime).toBeGreaterThanOrEqual(500);
    });

    test('should not exceed maximum move delay', async () => {
      gameState.setCurrentTurn(COLORS.BLACK);
      
      const startTime = Date.now();
      await aiPlayer.getMove(gameState);
      const endTime = Date.now();
      
      // Should not take more than 2000ms (maximum delay)
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('AI Hint Generation', () => {
    test('should return a hint move for current player', async () => {
      // Set up game state where white (human) should move
      gameState.setCurrentTurn(COLORS.WHITE);
      
      const hintMove = await aiPlayer.getHint(gameState);
      
      expect(hintMove).toBeDefined();
      expect(hintMove).toHaveProperty('fromRank');
      expect(hintMove).toHaveProperty('fromFile');
      expect(hintMove).toHaveProperty('toRank');
      expect(hintMove).toHaveProperty('toFile');
    });

    test('should use reduced depth for hints', async () => {
      const aiWithDepth4 = new AIPlayer(COLORS.BLACK, 4);
      gameState.setCurrentTurn(COLORS.WHITE);
      
      const startTime = Date.now();
      await aiWithDepth4.getHint(gameState);
      const endTime = Date.now();
      
      // Hint should be faster than full depth search
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('AI Color Switching', () => {
    test('should switch AI color', () => {
      expect(aiPlayer.getColor()).toBe(COLORS.BLACK);
      
      aiPlayer.setColor(COLORS.WHITE);
      
      expect(aiPlayer.getColor()).toBe(COLORS.WHITE);
    });

    test('should validate color when switching', () => {
      expect(() => aiPlayer.setColor('invalid')).toThrow('Invalid color');
    });
  });

  describe('AI Configuration', () => {
    test('should update search depth', () => {
      expect(aiPlayer.getDepth()).toBe(2);
      
      aiPlayer.setDepth(4);
      
      expect(aiPlayer.getDepth()).toBe(4);
    });

    test('should validate depth range', () => {
      expect(() => aiPlayer.setDepth(0)).toThrow('Depth must be between 1 and 6');
      expect(() => aiPlayer.setDepth(7)).toThrow('Depth must be between 1 and 6');
    });
  });
});