// ABOUTME: Jest test suite for move validation engine, testing all piece movement rules
// ABOUTME: Tests individual piece moves, path checking, and boundary validation following TDD

import { jest } from '@jest/globals';
import { isValidMove, getPossibleMoves, isPathClear, isSquareAttacked } from './moves.js';

// Helper function to create test board
function createTestBoard() {
  const board = [];
  for (let rank = 0; rank < 5; rank++) {
    board[rank] = [];
    for (let file = 0; file < 4; file++) {
      board[rank][file] = null;
    }
  }
  return board;
}

describe('Moves Module', () => {
  describe('Basic Move Validation', () => {
    test('should export isValidMove function', () => {
      expect(typeof isValidMove).toBe('function');
    });

    test('should export getPossibleMoves function', () => {
      expect(typeof getPossibleMoves).toBe('function');
    });

    test('should export isPathClear function', () => {
      expect(typeof isPathClear).toBe('function');
    });

    test('should export isSquareAttacked function', () => {
      expect(typeof isSquareAttacked).toBe('function');
    });

    test('should reject moves outside board boundaries', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'R', color: 'white' };
      
      // Out of bounds moves
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: -1, file: 0}, 'R', 'white')).toBe(false);
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 5, file: 0}, 'R', 'white')).toBe(false);
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 0, file: -1}, 'R', 'white')).toBe(false);
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 0, file: 4}, 'R', 'white')).toBe(false);
    });

    test('should reject move to same square', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'K', color: 'white' };
      
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 0, file: 0}, 'K', 'white')).toBe(false);
    });

    test('should reject capture of own piece', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'R', color: 'white' };
      board[0][1] = { piece: 'N', color: 'white' };
      
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 0, file: 1}, 'R', 'white')).toBe(false);
    });
  });

  describe('Rook Movement', () => {
    test('should allow rook to move horizontally', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'R', color: 'white' };
      
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 0, file: 3}, 'R', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 0, file: 2}, 'R', 'white')).toBe(true);
    });

    test('should allow rook to move vertically', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'R', color: 'white' };
      
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 4, file: 0}, 'R', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 2, file: 0}, 'R', 'white')).toBe(true);
    });

    test('should reject rook diagonal moves', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'R', color: 'white' };
      
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 1, file: 1}, 'R', 'white')).toBe(false);
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 2, file: 2}, 'R', 'white')).toBe(false);
    });

    test('should reject rook move through piece', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'R', color: 'white' };
      board[0][1] = { piece: 'P', color: 'black' };
      
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 0, file: 2}, 'R', 'white')).toBe(false);
    });

    test('should allow rook to capture enemy piece', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'R', color: 'white' };
      board[0][3] = { piece: 'P', color: 'black' };
      
      expect(isValidMove(board, {rank: 0, file: 0}, {rank: 0, file: 3}, 'R', 'white')).toBe(true);
    });
  });

  describe('Bishop Movement', () => {
    test('should allow bishop to move diagonally', () => {
      const board = createTestBoard();
      board[1][1] = { piece: 'B', color: 'white' };
      
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 3, file: 3}, 'B', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 0, file: 0}, 'B', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 0, file: 2}, 'B', 'white')).toBe(true);
    });

    test('should reject bishop horizontal/vertical moves', () => {
      const board = createTestBoard();
      board[1][1] = { piece: 'B', color: 'white' };
      
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 1, file: 3}, 'B', 'white')).toBe(false);
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 3, file: 1}, 'B', 'white')).toBe(false);
    });

    test('should reject bishop move through piece', () => {
      const board = createTestBoard();
      board[1][1] = { piece: 'B', color: 'white' };
      board[2][2] = { piece: 'P', color: 'black' };
      
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 3, file: 3}, 'B', 'white')).toBe(false);
    });
  });

  describe('Knight Movement', () => {
    test('should allow knight L-shaped moves', () => {
      const board = createTestBoard();
      board[2][1] = { piece: 'N', color: 'white' };
      
      // All possible L-moves from b3
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 4, file: 2}, 'N', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 4, file: 0}, 'N', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 0, file: 2}, 'N', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 0, file: 0}, 'N', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 3, file: 3}, 'N', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 1, file: 3}, 'N', 'white')).toBe(true);
    });

    test('should reject non-L-shaped knight moves', () => {
      const board = createTestBoard();
      board[2][1] = { piece: 'N', color: 'white' };
      
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 2, file: 3}, 'N', 'white')).toBe(false);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 4, file: 1}, 'N', 'white')).toBe(false);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 3, file: 2}, 'N', 'white')).toBe(false);
    });

    test('should allow knight to jump over pieces', () => {
      const board = createTestBoard();
      board[2][1] = { piece: 'N', color: 'white' };
      board[3][1] = { piece: 'P', color: 'black' };
      board[2][2] = { piece: 'P', color: 'white' };
      
      // Knight should be able to jump over pieces
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 4, file: 2}, 'N', 'white')).toBe(true);
    });
  });

  describe('King Movement', () => {
    test('should allow king to move one square in any direction', () => {
      const board = createTestBoard();
      board[2][1] = { piece: 'K', color: 'white' };
      
      // All 8 directions
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 3, file: 1}, 'K', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 1, file: 1}, 'K', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 2, file: 2}, 'K', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 2, file: 0}, 'K', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 3, file: 2}, 'K', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 3, file: 0}, 'K', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 1, file: 2}, 'K', 'white')).toBe(true);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 1, file: 0}, 'K', 'white')).toBe(true);
    });

    test('should reject king moves more than one square', () => {
      const board = createTestBoard();
      board[2][1] = { piece: 'K', color: 'white' };
      
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 4, file: 1}, 'K', 'white')).toBe(false);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 2, file: 3}, 'K', 'white')).toBe(false);
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 4, file: 3}, 'K', 'white')).toBe(false);
    });
  });

  describe('Pawn Movement', () => {
    test('should allow white pawn to move forward one square', () => {
      const board = createTestBoard();
      board[1][1] = { piece: 'P', color: 'white' };
      
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 2, file: 1}, 'P', 'white')).toBe(true);
    });

    test('should allow black pawn to move forward one square', () => {
      const board = createTestBoard();
      board[3][1] = { piece: 'P', color: 'black' };
      
      expect(isValidMove(board, {rank: 3, file: 1}, {rank: 2, file: 1}, 'P', 'black')).toBe(true);
    });

    test('should reject pawn backward moves', () => {
      const board = createTestBoard();
      board[2][1] = { piece: 'P', color: 'white' };
      
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 1, file: 1}, 'P', 'white')).toBe(false);
    });

    test('should reject pawn sideways moves', () => {
      const board = createTestBoard();
      board[2][1] = { piece: 'P', color: 'white' };
      
      expect(isValidMove(board, {rank: 2, file: 1}, {rank: 2, file: 2}, 'P', 'white')).toBe(false);
    });

    test('should reject pawn forward move when blocked', () => {
      const board = createTestBoard();
      board[1][1] = { piece: 'P', color: 'white' };
      board[2][1] = { piece: 'P', color: 'black' };
      
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 2, file: 1}, 'P', 'white')).toBe(false);
    });

    test('should allow pawn diagonal capture', () => {
      const board = createTestBoard();
      board[1][1] = { piece: 'P', color: 'white' };
      board[2][2] = { piece: 'P', color: 'black' };
      
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 2, file: 2}, 'P', 'white')).toBe(true);
    });

    test('should reject pawn diagonal move without capture', () => {
      const board = createTestBoard();
      board[1][1] = { piece: 'P', color: 'white' };
      
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 2, file: 2}, 'P', 'white')).toBe(false);
    });

    test('should reject pawn double move (no double moves in microchess)', () => {
      const board = createTestBoard();
      board[1][1] = { piece: 'P', color: 'white' };
      
      expect(isValidMove(board, {rank: 1, file: 1}, {rank: 3, file: 1}, 'P', 'white')).toBe(false);
    });
  });

  describe('Path Checking', () => {
    test('should detect clear horizontal path', () => {
      const board = createTestBoard();
      
      expect(isPathClear(board, {rank: 0, file: 0}, {rank: 0, file: 3})).toBe(true);
    });

    test('should detect blocked horizontal path', () => {
      const board = createTestBoard();
      board[0][1] = { piece: 'P', color: 'white' };
      
      expect(isPathClear(board, {rank: 0, file: 0}, {rank: 0, file: 3})).toBe(false);
    });

    test('should detect clear vertical path', () => {
      const board = createTestBoard();
      
      expect(isPathClear(board, {rank: 0, file: 0}, {rank: 4, file: 0})).toBe(true);
    });

    test('should detect blocked vertical path', () => {
      const board = createTestBoard();
      board[2][0] = { piece: 'P', color: 'white' };
      
      expect(isPathClear(board, {rank: 0, file: 0}, {rank: 4, file: 0})).toBe(false);
    });

    test('should detect clear diagonal path', () => {
      const board = createTestBoard();
      
      expect(isPathClear(board, {rank: 0, file: 0}, {rank: 3, file: 3})).toBe(true);
    });

    test('should detect blocked diagonal path', () => {
      const board = createTestBoard();
      board[1][1] = { piece: 'P', color: 'white' };
      
      expect(isPathClear(board, {rank: 0, file: 0}, {rank: 3, file: 3})).toBe(false);
    });
  });

  describe('Get Possible Moves', () => {
    test('should return array of possible moves for rook', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'R', color: 'white' };
      
      const moves = getPossibleMoves(board, {rank: 0, file: 0}, 'R', 'white');
      expect(Array.isArray(moves)).toBe(true);
      expect(moves.length).toBeGreaterThan(0);
    });

    test('should return empty array for piece with no moves', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'K', color: 'white' };
      // Surround king with own pieces
      board[0][1] = { piece: 'P', color: 'white' };
      board[1][0] = { piece: 'P', color: 'white' };
      board[1][1] = { piece: 'P', color: 'white' };
      
      const moves = getPossibleMoves(board, {rank: 0, file: 0}, 'K', 'white');
      expect(moves).toHaveLength(0);
    });

    test('should include capture moves but not friendly fire', () => {
      const board = createTestBoard();
      board[0][0] = { piece: 'R', color: 'white' };
      board[0][2] = { piece: 'P', color: 'black' }; // Enemy piece (no blocking piece)
      board[0][3] = { piece: 'P', color: 'white' }; // Friendly piece beyond enemy
      
      const moves = getPossibleMoves(board, {rank: 0, file: 0}, 'R', 'white');
      
      // Should include move to 0,1 (empty square)
      expect(moves.find(move => move.rank === 0 && move.file === 1)).toBeDefined();
      // Should include move to 0,2 (enemy piece, can capture)
      expect(moves.find(move => move.rank === 0 && move.file === 2)).toBeDefined();
      // Should not include moves beyond the enemy piece (friendly piece)
      expect(moves.find(move => move.rank === 0 && move.file === 3)).toBeUndefined();
    });
  });
});