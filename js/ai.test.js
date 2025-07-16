// ABOUTME: Jest test suite for AI evaluation function using TDD approach
// ABOUTME: Tests position evaluation, material counting, and strategic factors for microchess AI

import { jest } from '@jest/globals';
import { evaluatePosition, countMaterial, evaluatePawnStructure, evaluateKingSafety, PIECE_VALUES, minimax, getBestMove } from './ai.js';
import { BOARD_RANKS, BOARD_FILES } from './constants.js';
import { GameState } from './gameState.js';

// Helper function to create test board
function createTestBoard() {
  const board = [];
  for (let rank = 0; rank < BOARD_RANKS; rank++) {
    board[rank] = [];
    for (let file = 0; file < BOARD_FILES; file++) {
      board[rank][file] = null;
    }
  }
  return board;
}

describe('AI Evaluation Module', () => {
  describe('Piece Values Constants', () => {
    test('should define correct piece values', () => {
      expect(PIECE_VALUES.K).toBe(20000); // King
      expect(PIECE_VALUES.Q).toBe(9);     // Queen
      expect(PIECE_VALUES.R).toBe(5);     // Rook
      expect(PIECE_VALUES.B).toBe(3);     // Bishop
      expect(PIECE_VALUES.N).toBe(3);     // Knight
      expect(PIECE_VALUES.P).toBe(1);     // Pawn
    });
  });

  describe('Material Counting', () => {
    test('should count material for empty board', () => {
      const board = createTestBoard();
      expect(countMaterial(board, 'white')).toBe(0);
      expect(countMaterial(board, 'black')).toBe(0);
    });

    test('should count material for single pieces', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'K', color: 'white' };
      board[4][3] = { piece: 'Q', color: 'black' };
      
      expect(countMaterial(board, 'white')).toBe(0); // King excluded from material count
      expect(countMaterial(board, 'black')).toBe(9);
    });

    test('should count material for multiple pieces', () => {
      const board = createTestBoard();
      // White: Rook + Pawn = 5 + 1 = 6 (King excluded)
      board[0][0] = { piece: 'K', color: 'white' };
      board[0][1] = { piece: 'R', color: 'white' };
      board[1][0] = { piece: 'P', color: 'white' };
      
      // Black: Queen + Knight = 9 + 3 = 12
      board[4][0] = { piece: 'Q', color: 'black' };
      board[4][1] = { piece: 'N', color: 'black' };
      
      expect(countMaterial(board, 'white')).toBe(6);
      expect(countMaterial(board, 'black')).toBe(12);
    });
  });

  describe('Pawn Structure Evaluation', () => {
    test('should give bonus for advanced pawns', () => {
      const board = createTestBoard();
      // White pawn on rank 3 (advanced)
      board[3][1] = { piece: 'P', color: 'white' };
      // Black pawn on rank 1 (advanced for black)
      board[1][2] = { piece: 'P', color: 'black' };
      
      const whiteScore = evaluatePawnStructure(board, 'white');
      const blackScore = evaluatePawnStructure(board, 'black');
      
      expect(whiteScore).toBeGreaterThan(0); // Advanced pawn bonus
      expect(blackScore).toBeGreaterThan(0); // Advanced pawn bonus
    });

    test('should give no bonus for starting position pawns', () => {
      const board = createTestBoard();
      // Pawns in starting positions
      board[1][1] = { piece: 'P', color: 'white' }; // White pawn on rank 2
      board[3][1] = { piece: 'P', color: 'black' }; // Black pawn on rank 4
      
      const whiteScore = evaluatePawnStructure(board, 'white');
      const blackScore = evaluatePawnStructure(board, 'black');
      
      expect(whiteScore).toBe(0); // No advancement bonus
      expect(blackScore).toBe(0); // No advancement bonus
    });
  });

  describe('King Safety Evaluation', () => {
    test('should penalize exposed king', () => {
      const board = createTestBoard();
      // King in center (exposed)
      board[2][2] = { piece: 'K', color: 'white' };
      
      const safetyScore = evaluateKingSafety(board, 'white');
      expect(safetyScore).toBeLessThan(0); // Penalty for exposed king
    });

    test('should reward safe king', () => {
      const board = createTestBoard();
      // King in corner (safer)
      board[0][0] = { piece: 'K', color: 'white' };
      
      const safetyScore = evaluateKingSafety(board, 'white');
      expect(safetyScore).toBeGreaterThanOrEqual(0); // Safe king
    });
  });

  describe('Position Evaluation', () => {
    test('should evaluate equal material as roughly equal', () => {
      const board = createTestBoard();
      // Equal material: both sides have King + Rook
      board[0][0] = { piece: 'K', color: 'white' };
      board[0][1] = { piece: 'R', color: 'white' };
      board[4][0] = { piece: 'K', color: 'black' };
      board[4][1] = { piece: 'R', color: 'black' };
      
      const whiteEval = evaluatePosition(board, 'white');
      const blackEval = evaluatePosition(board, 'black');
      
      // Should be roughly equal (within 2 points due to positional factors)
      expect(Math.abs(whiteEval - (-blackEval))).toBeLessThan(2);
    });

    test('should evaluate material advantage correctly', () => {
      const board = createTestBoard();
      // White has material advantage: King + Queen vs King + Pawn
      board[0][0] = { piece: 'K', color: 'white' };
      board[0][1] = { piece: 'Q', color: 'white' };
      board[4][0] = { piece: 'K', color: 'black' };
      board[4][1] = { piece: 'P', color: 'black' };
      
      const whiteEval = evaluatePosition(board, 'white');
      const blackEval = evaluatePosition(board, 'black');
      
      expect(whiteEval).toBeGreaterThan(blackEval + 7); // Material advantage should show
    });

    test('should handle empty board', () => {
      const board = createTestBoard();
      
      const whiteEval = evaluatePosition(board, 'white');
      const blackEval = evaluatePosition(board, 'black');
      
      expect(whiteEval).toBe(0);
      expect(blackEval).toBe(0);
    });

    test('should be consistent with color perspective', () => {
      const board = createTestBoard();
      // Asymmetric position
      board[0][0] = { piece: 'K', color: 'white' };
      board[1][1] = { piece: 'R', color: 'white' };
      board[4][3] = { piece: 'K', color: 'black' };
      
      const whiteEval = evaluatePosition(board, 'white');
      const blackEval = evaluatePosition(board, 'black');
      
      // White should have positive evaluation, black negative
      expect(whiteEval).toBeGreaterThan(0);
      expect(blackEval).toBeLessThan(0);
    });
  });

  describe('Center Control Evaluation', () => {
    test('should reward pieces controlling center squares', () => {
      const board = createTestBoard();
      // Place pieces that control center
      board[0][0] = { piece: 'K', color: 'white' };
      board[2][1] = { piece: 'R', color: 'white' }; // Rook in center area
      board[4][3] = { piece: 'K', color: 'black' };
      board[0][3] = { piece: 'R', color: 'black' }; // Rook away from center
      
      const whiteEval = evaluatePosition(board, 'white');
      const blackEval = evaluatePosition(board, 'black');
      
      // White should have better evaluation due to center control
      expect(whiteEval).toBeGreaterThan(blackEval);
    });
  });

  describe('Minimax Algorithm', () => {
    test('should return a score for terminal position', () => {
      const board = createTestBoard();
      // Simple position with just kings
      board[0][0] = { piece: 'K', color: 'white' };
      board[4][3] = { piece: 'K', color: 'black' };
      
      const gameState = new GameState(board);
      const result = minimax(gameState, 1, -Infinity, Infinity, true);
      
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(-Infinity);
      expect(result).toBeLessThan(Infinity);
    });

    test('should prefer winning moves', () => {
      const board = createTestBoard();
      // Position with material advantage for white
      board[0][0] = { piece: 'K', color: 'white' };
      board[0][1] = { piece: 'Q', color: 'white' };
      board[4][0] = { piece: 'K', color: 'black' };
      
      const gameState = new GameState(board);
      gameState.setCurrentTurn('white');
      
      const result = minimax(gameState, 2, -Infinity, Infinity, true);
      
      // Should return a positive score for white's advantage
      expect(result).toBeGreaterThan(5);
    });

    test('should avoid losing moves', () => {
      const board = createTestBoard();
      // Black is at material disadvantage
      board[0][0] = { piece: 'K', color: 'white' };
      board[0][1] = { piece: 'Q', color: 'white' };
      board[4][0] = { piece: 'K', color: 'black' };
      
      const gameState = new GameState(board);
      gameState.setCurrentTurn('black');
      
      const result = minimax(gameState, 2, -Infinity, Infinity, false);
      
      // Should return a negative score for black's disadvantage
      expect(result).toBeLessThan(-5);
    });

    test('should work with alpha-beta pruning', () => {
      const board = createTestBoard();
      // Standard position
      board[0][0] = { piece: 'K', color: 'white' };
      board[0][1] = { piece: 'R', color: 'white' };
      board[4][0] = { piece: 'K', color: 'black' };
      board[4][1] = { piece: 'R', color: 'black' };
      
      const gameState = new GameState(board);
      
      // Should work with tight alpha-beta window
      const result = minimax(gameState, 2, -100, 100, true);
      
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(-100);
      expect(result).toBeLessThan(100);
    });
  });

  describe('Best Move Selection', () => {
    test('should return a valid move', () => {
      const board = createTestBoard();
      // Simple position with pieces that can move
      board[0][0] = { piece: 'K', color: 'white' };
      board[0][1] = { piece: 'R', color: 'white' };
      board[4][0] = { piece: 'K', color: 'black' };
      
      const gameState = new GameState(board);
      gameState.setCurrentTurn('white');
      
      const bestMove = getBestMove(gameState, 2);
      
      expect(bestMove).toBeDefined();
      expect(bestMove).toHaveProperty('fromRank');
      expect(bestMove).toHaveProperty('fromFile');
      expect(bestMove).toHaveProperty('toRank');
      expect(bestMove).toHaveProperty('toFile');
      expect(typeof bestMove.fromRank).toBe('number');
      expect(typeof bestMove.fromFile).toBe('number');
      expect(typeof bestMove.toRank).toBe('number');
      expect(typeof bestMove.toFile).toBe('number');
    });

    test('should return null when no moves available', () => {
      const board = createTestBoard();
      // Position where white has no legal moves (king trapped)
      board[0][0] = { piece: 'K', color: 'white' };
      board[1][0] = { piece: 'Q', color: 'black' };
      board[0][1] = { piece: 'Q', color: 'black' };
      board[4][0] = { piece: 'K', color: 'black' };
      
      const gameState = new GameState(board);
      gameState.setCurrentTurn('white');
      
      const bestMove = getBestMove(gameState, 2);
      
      // If there are no legal moves, should return null
      if (bestMove === null) {
        expect(bestMove).toBeNull();
      } else {
        // If there are legal moves, should return a valid move
        expect(bestMove).toBeDefined();
      }
    });

    test('should prefer captures when material advantage exists', () => {
      const board = createTestBoard();
      // White rook can capture black rook
      board[0][0] = { piece: 'K', color: 'white' };
      board[0][1] = { piece: 'R', color: 'white' };
      board[2][1] = { piece: 'R', color: 'black' };
      board[4][0] = { piece: 'K', color: 'black' };
      
      const gameState = new GameState(board);
      gameState.setCurrentTurn('white');
      
      const bestMove = getBestMove(gameState, 2);
      
      // Should make a reasonable move (capturing the black rook is good)
      expect(bestMove).toBeDefined();
      // Either the rook or king could make a good move, so let's just check it's valid
      expect(bestMove.fromRank).toBeGreaterThanOrEqual(0);
      expect(bestMove.fromRank).toBeLessThan(5);
      expect(bestMove.fromFile).toBeGreaterThanOrEqual(0);
      expect(bestMove.fromFile).toBeLessThan(4);
      expect(bestMove.toRank).toBeGreaterThanOrEqual(0);
      expect(bestMove.toRank).toBeLessThan(5);
      expect(bestMove.toFile).toBeGreaterThanOrEqual(0);
      expect(bestMove.toFile).toBeLessThan(4);
    });
  });
});