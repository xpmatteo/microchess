// ABOUTME: Jest test suite for game state management, testing move execution and check detection
// ABOUTME: Tests game state tracking, turn management, and game end conditions following TDD

import { jest } from '@jest/globals';
import { GameState } from './gameState.js';
import { INITIAL_POSITION } from './pieces.js';
import { BOARD_RANKS, BOARD_FILES } from './constants.js';

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

describe('GameState Module', () => {
  describe('Basic GameState Construction', () => {
    test('should create GameState with initial position', () => {
      const gameState = new GameState();
      expect(gameState).toBeDefined();
      expect(gameState.getCurrentTurn()).toBe('white');
      expect(gameState.getBoard()).toEqual(INITIAL_POSITION);
    });

    test('should create GameState with custom board', () => {
      const customBoard = createTestBoard();
      const gameState = new GameState(customBoard);
      expect(gameState.getBoard()).toEqual(customBoard);
    });

    test('should track current turn', () => {
      const gameState = new GameState();
      expect(gameState.getCurrentTurn()).toBe('white');
    });

    test('should track game status', () => {
      const gameState = new GameState();
      expect(gameState.getGameStatus()).toBe('playing');
    });
  });

  describe('Move Execution', () => {
    test('should execute valid move', () => {
      const gameState = new GameState();
      const initialBoard = gameState.getBoard();
      
      // Move white pawn from d2 to d3
      const move = {
        from: { rank: 1, file: 3 },
        to: { rank: 2, file: 3 }
      };
      
      const result = gameState.executeMove(move);
      expect(result).toBe(true);
      
      // Check that piece moved
      expect(gameState.getPieceAt(2, 3)).toEqual({ piece: 'P', color: 'white' });
      expect(gameState.getPieceAt(1, 3)).toBe(null);
      
      // Check that turn switched
      expect(gameState.getCurrentTurn()).toBe('black');
    });

    test('should reject invalid move', () => {
      const gameState = new GameState();
      
      // Try to move pawn backwards
      const move = {
        from: { rank: 1, file: 3 },
        to: { rank: 0, file: 3 }
      };
      
      const result = gameState.executeMove(move);
      expect(result).toBe(false);
      
      // Check that board unchanged
      expect(gameState.getPieceAt(1, 3)).toEqual({ piece: 'P', color: 'white' });
      expect(gameState.getPieceAt(0, 3)).toEqual({ piece: 'K', color: 'white' });
      
      // Check that turn didn't switch
      expect(gameState.getCurrentTurn()).toBe('white');
    });

    test('should reject move when no piece at source', () => {
      const gameState = new GameState();
      
      // Try to move from empty square
      const move = {
        from: { rank: 2, file: 0 },
        to: { rank: 3, file: 0 }
      };
      
      const result = gameState.executeMove(move);
      expect(result).toBe(false);
      expect(gameState.getCurrentTurn()).toBe('white');
    });

    test('should reject move of opponent piece', () => {
      const gameState = new GameState();
      
      // Try to move black piece on white turn
      const move = {
        from: { rank: 3, file: 0 },
        to: { rank: 2, file: 0 }
      };
      
      const result = gameState.executeMove(move);
      expect(result).toBe(false);
      expect(gameState.getCurrentTurn()).toBe('white');
    });
  });

  describe('Check Detection', () => {
    test('should detect when king is in check', () => {
      const board = createTestBoard();
      // Place white king and black rook attacking it
      board[2][2] = { piece: 'K', color: 'white' };
      board[2][0] = { piece: 'R', color: 'black' };
      
      const gameState = new GameState(board);
      expect(gameState.isKingInCheck('white')).toBe(true);
      expect(gameState.isKingInCheck('black')).toBe(false);
    });

    test('should detect when king is not in check', () => {
      const gameState = new GameState();
      expect(gameState.isKingInCheck('white')).toBe(false);
      expect(gameState.isKingInCheck('black')).toBe(false);
    });

    test('should prevent move that leaves king in check', () => {
      const board = createTestBoard();
      // Place white king, white rook blocking check from black rook
      board[2][2] = { piece: 'K', color: 'white' };
      board[2][1] = { piece: 'R', color: 'white' };
      board[2][0] = { piece: 'R', color: 'black' };
      
      const gameState = new GameState(board);
      gameState.setCurrentTurn('white');
      
      // Try to move blocking rook away (would expose king to check)
      const move = {
        from: { rank: 2, file: 1 },
        to: { rank: 3, file: 1 }
      };
      
      const result = gameState.executeMove(move);
      expect(result).toBe(false);
    });
  });

  describe('Game Status', () => {
    test('should detect checkmate', () => {
      const board = createTestBoard();
      // Setup checkmate position - white king in corner with no escape
      board[0][0] = { piece: 'K', color: 'white' };
      board[1][0] = { piece: 'R', color: 'black' }; // Attacks king and blocks escape
      board[0][1] = { piece: 'R', color: 'black' }; // Attacks king and blocks escape
      board[1][1] = { piece: 'R', color: 'black' }; // Blocks diagonal escape
      
      const gameState = new GameState(board);
      gameState.setCurrentTurn('white'); // Make sure it's white's turn
      expect(gameState.isCheckmate('white')).toBe(true);
      expect(gameState.getGameStatus()).toBe('checkmate');
    });

    test('should detect stalemate', () => {
      const board = createTestBoard();
      // Setup stalemate position: king in corner, NOT in check, but no legal moves
      board[0][0] = { piece: 'K', color: 'white' };
      board[1][2] = { piece: 'R', color: 'black' }; // Controls (1,0) and (1,1)
      board[2][1] = { piece: 'R', color: 'black' }; // Controls (0,1) and (1,1)
      
      const gameState = new GameState(board);
      gameState.setCurrentTurn('white'); // Make sure it's white's turn
      expect(gameState.isKingInCheck('white')).toBe(false); // Verify not in check
      expect(gameState.isStalemate('white')).toBe(true);
      expect(gameState.getGameStatus()).toBe('stalemate');
    });

    test('should continue playing when game not over', () => {
      const gameState = new GameState();
      expect(gameState.getGameStatus()).toBe('playing');
    });
  });

  describe('Move History', () => {
    test('should track move history', () => {
      const gameState = new GameState();
      
      const move1 = {
        from: { rank: 1, file: 3 },
        to: { rank: 2, file: 3 }
      };
      
      gameState.executeMove(move1);
      
      const history = gameState.getMoveHistory();
      expect(history).toHaveLength(1);
      expect(history[0].from).toEqual(move1.from);
      expect(history[0].to).toEqual(move1.to);
    });

    test('should be able to undo last move', () => {
      const gameState = new GameState();
      const initialBoard = JSON.parse(JSON.stringify(gameState.getBoard()));
      
      const move = {
        from: { rank: 1, file: 3 },
        to: { rank: 2, file: 3 }
      };
      
      gameState.executeMove(move);
      expect(gameState.getCurrentTurn()).toBe('black');
      
      const undoResult = gameState.undoLastMove();
      expect(undoResult).toBe(true);
      expect(gameState.getBoard()).toEqual(initialBoard);
      expect(gameState.getCurrentTurn()).toBe('white');
    });

    test('should not undo when no moves to undo', () => {
      const gameState = new GameState();
      const result = gameState.undoLastMove();
      expect(result).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    test('should find king position', () => {
      const gameState = new GameState();
      const whiteKingPos = gameState.findKingPosition('white');
      const blackKingPos = gameState.findKingPosition('black');
      
      expect(whiteKingPos).toEqual({ rank: 0, file: 3 });
      expect(blackKingPos).toEqual({ rank: 4, file: 0 });
    });

    test('should get piece at position', () => {
      const gameState = new GameState();
      
      // Test initial position pieces
      expect(gameState.getPieceAt(0, 0)).toEqual({ piece: 'R', color: 'white' });
      expect(gameState.getPieceAt(1, 3)).toEqual({ piece: 'P', color: 'white' });
      expect(gameState.getPieceAt(2, 0)).toBe(null);
    });

    test('should set piece at position', () => {
      const gameState = new GameState();
      
      const piece = { piece: 'Q', color: 'white' };
      gameState.setPieceAt(2, 2, piece);
      
      expect(gameState.getPieceAt(2, 2)).toEqual(piece);
    });
  });

  describe('Error Handling', () => {
    let gameState;
    
    beforeEach(() => {
      gameState = new GameState();
    });
    
    describe('getPieceAt', () => {
      test('should throw error for non-numeric rank', () => {
        expect(() => gameState.getPieceAt('invalid', 0)).toThrow('Invalid parameter types: rank=string, file=number. Both must be numbers.');
      });
      
      test('should throw error for non-numeric file', () => {
        expect(() => gameState.getPieceAt(0, 'invalid')).toThrow('Invalid parameter types: rank=number, file=string. Both must be numbers.');
      });
      
      test('should throw error for both non-numeric parameters', () => {
        expect(() => gameState.getPieceAt('invalid', 'invalid')).toThrow('Invalid parameter types: rank=string, file=string. Both must be numbers.');
      });
      
      test('should throw error for null parameters', () => {
        expect(() => gameState.getPieceAt(null, 0)).toThrow('Invalid parameter types: rank=object, file=number. Both must be numbers.');
        expect(() => gameState.getPieceAt(0, null)).toThrow('Invalid parameter types: rank=number, file=object. Both must be numbers.');
      });
      
      test('should throw error for undefined parameters', () => {
        expect(() => gameState.getPieceAt(undefined, 0)).toThrow('Invalid parameter types: rank=undefined, file=number. Both must be numbers.');
        expect(() => gameState.getPieceAt(0, undefined)).toThrow('Invalid parameter types: rank=number, file=undefined. Both must be numbers.');
      });
      
      test('should throw error for NaN parameters', () => {
        expect(() => gameState.getPieceAt(NaN, 0)).toThrow('Invalid parameter values: rank=NaN, file=0. Both must be valid numbers.');
        expect(() => gameState.getPieceAt(0, NaN)).toThrow('Invalid parameter values: rank=0, file=NaN. Both must be valid numbers.');
      });
      
      test('should throw error for negative rank', () => {
        expect(() => gameState.getPieceAt(-1, 0)).toThrow('Position out of bounds: rank=-1, file=0. Valid range: rank(0-4), file(0-3).');
      });
      
      test('should throw error for negative file', () => {
        expect(() => gameState.getPieceAt(0, -1)).toThrow('Position out of bounds: rank=0, file=-1. Valid range: rank(0-4), file(0-3).');
      });
      
      test('should throw error for rank too high', () => {
        expect(() => gameState.getPieceAt(5, 0)).toThrow('Position out of bounds: rank=5, file=0. Valid range: rank(0-4), file(0-3).');
      });
      
      test('should throw error for file too high', () => {
        expect(() => gameState.getPieceAt(0, 4)).toThrow('Position out of bounds: rank=0, file=4. Valid range: rank(0-4), file(0-3).');
      });
      
      test('should throw error for both coordinates out of bounds', () => {
        expect(() => gameState.getPieceAt(10, 10)).toThrow('Position out of bounds: rank=10, file=10. Valid range: rank(0-4), file(0-3).');
      });
    });
    
    describe('getValidMovesForPiece', () => {
      test('should throw error for non-numeric rank', () => {
        expect(() => gameState.getValidMovesForPiece('invalid', 0)).toThrow('Invalid parameter types: rank=string, file=number. Both must be numbers.');
      });
      
      test('should throw error for non-numeric file', () => {
        expect(() => gameState.getValidMovesForPiece(0, 'invalid')).toThrow('Invalid parameter types: rank=number, file=string. Both must be numbers.');
      });
      
      test('should throw error for out of bounds position', () => {
        expect(() => gameState.getValidMovesForPiece(-1, 0)).toThrow('Position out of bounds: rank=-1, file=0. Valid range: rank(0-4), file(0-3).');
        expect(() => gameState.getValidMovesForPiece(0, -1)).toThrow('Position out of bounds: rank=0, file=-1. Valid range: rank(0-4), file(0-3).');
        expect(() => gameState.getValidMovesForPiece(5, 0)).toThrow('Position out of bounds: rank=5, file=0. Valid range: rank(0-4), file(0-3).');
        expect(() => gameState.getValidMovesForPiece(0, 4)).toThrow('Position out of bounds: rank=0, file=4. Valid range: rank(0-4), file(0-3).');
      });
      
      test('should return empty array for valid position with no piece', () => {
        expect(gameState.getValidMovesForPiece(2, 2)).toEqual([]);
      });
      
      test('should return empty array for opponent piece', () => {
        gameState.setCurrentTurn('white');
        expect(gameState.getValidMovesForPiece(4, 0)).toEqual([]); // Black king
      });
      
      test('should return valid moves for own piece', () => {
        gameState.setCurrentTurn('white');
        const moves = gameState.getValidMovesForPiece(1, 3); // White pawn
        expect(Array.isArray(moves)).toBe(true);
        expect(moves.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Visual Feedback Methods', () => {
    test('should return last move after making a move', () => {
      const gameState = new GameState();
      
      // Initially no last move
      expect(gameState.getLastMove()).toBe(null);
      
      // Make a move
      const move = {
        from: { rank: 1, file: 3 },
        to: { rank: 2, file: 3 }
      };
      gameState.executeMove(move);
      
      // Should return the last move
      const lastMove = gameState.getLastMove();
      expect(lastMove).toBeDefined();
      expect(lastMove.from).toEqual(move.from);
      expect(lastMove.to).toEqual(move.to);
      expect(lastMove.piece).toEqual({ piece: 'P', color: 'white' });
      expect(lastMove.capturedPiece).toBe(null);
    });

    test('should return null when king is not in check', () => {
      const gameState = new GameState();
      
      // Initial position - no king in check
      expect(gameState.getKingInCheck()).toBe(null);
    });

    test('should return king position when in check', () => {
      const board = createTestBoard();
      // Place white king and black rook attacking it
      board[2][2] = { piece: 'K', color: 'white' };
      board[2][0] = { piece: 'R', color: 'black' };
      
      const gameState = new GameState(board);
      gameState.setCurrentTurn('white');
      
      const kingInCheck = gameState.getKingInCheck();
      expect(kingInCheck).toEqual({ rank: 2, file: 2 });
    });

    test('should return null when opponent king is in check but not current player', () => {
      const board = createTestBoard();
      // Place black king and white rook attacking it
      board[2][2] = { piece: 'K', color: 'black' };
      board[2][0] = { piece: 'R', color: 'white' };
      
      const gameState = new GameState(board);
      gameState.setCurrentTurn('white'); // White's turn, but black king in check
      
      expect(gameState.getKingInCheck()).toBe(null);
    });
  });
});