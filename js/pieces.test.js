// ABOUTME: Jest test suite for chess pieces module, testing piece symbols and initial board setup
// ABOUTME: Tests piece definitions, Unicode symbols, and microchess starting position following TDD

import { jest } from '@jest/globals';
import { PIECE_SYMBOLS, INITIAL_POSITION } from './pieces.js';

describe('Pieces Module', () => {
  describe('Piece Symbols', () => {
    test('should export PIECE_SYMBOLS object', () => {
      expect(PIECE_SYMBOLS).toBeDefined();
      expect(typeof PIECE_SYMBOLS).toBe('object');
    });

    test('should have Unicode symbols for white pieces', () => {
      expect(PIECE_SYMBOLS.white.K).toBe('♔'); // King
      expect(PIECE_SYMBOLS.white.Q).toBe('♕'); // Queen
      expect(PIECE_SYMBOLS.white.R).toBe('♖'); // Rook
      expect(PIECE_SYMBOLS.white.B).toBe('♗'); // Bishop
      expect(PIECE_SYMBOLS.white.N).toBe('♘'); // Knight
      expect(PIECE_SYMBOLS.white.P).toBe('♙'); // Pawn
    });

    test('should have Unicode symbols for black pieces', () => {
      expect(PIECE_SYMBOLS.black.K).toBe('♚'); // King
      expect(PIECE_SYMBOLS.black.Q).toBe('♛'); // Queen
      expect(PIECE_SYMBOLS.black.R).toBe('♜'); // Rook
      expect(PIECE_SYMBOLS.black.B).toBe('♝'); // Bishop
      expect(PIECE_SYMBOLS.black.N).toBe('♞'); // Knight
      expect(PIECE_SYMBOLS.black.P).toBe('♟'); // Pawn
    });
  });

  describe('Initial Position', () => {
    test('should export INITIAL_POSITION array', () => {
      expect(INITIAL_POSITION).toBeDefined();
      expect(Array.isArray(INITIAL_POSITION)).toBe(true);
    });

    test('should be a 5x4 board', () => {
      expect(INITIAL_POSITION).toHaveLength(5); // 5 ranks
      INITIAL_POSITION.forEach(rank => {
        expect(rank).toHaveLength(4); // 4 files
      });
    });

    test('should have white pieces on rank 1 (index 0)', () => {
      const whiteBackRank = INITIAL_POSITION[0];
      expect(whiteBackRank[0]).toEqual({ piece: 'R', color: 'white' }); // a1 - Rook
      expect(whiteBackRank[1]).toEqual({ piece: 'N', color: 'white' }); // b1 - Knight
      expect(whiteBackRank[2]).toEqual({ piece: 'B', color: 'white' }); // c1 - Bishop
      expect(whiteBackRank[3]).toEqual({ piece: 'K', color: 'white' }); // d1 - King
    });

    test('should have white pawn on b2 (rank 1, file 1)', () => {
      expect(INITIAL_POSITION[1][1]).toEqual({ piece: 'P', color: 'white' }); // b2 - Pawn
    });

    test('should have black pawn on b4 (rank 3, file 1)', () => {
      expect(INITIAL_POSITION[3][1]).toEqual({ piece: 'P', color: 'black' }); // b4 - Pawn
    });

    test('should have black pieces on rank 5 (index 4)', () => {
      const blackBackRank = INITIAL_POSITION[4];
      expect(blackBackRank[0]).toEqual({ piece: 'R', color: 'black' }); // a5 - Rook
      expect(blackBackRank[1]).toEqual({ piece: 'N', color: 'black' }); // b5 - Knight
      expect(blackBackRank[2]).toEqual({ piece: 'B', color: 'black' }); // c5 - Bishop
      expect(blackBackRank[3]).toEqual({ piece: 'K', color: 'black' }); // d5 - King
    });

    test('should have empty squares in correct positions', () => {
      // Rank 1 (index 0) should have pieces only on a1, b1, c1, d1
      // Rank 2 (index 1) should have piece only on b2, others null
      expect(INITIAL_POSITION[1][0]).toBeNull(); // a2
      expect(INITIAL_POSITION[1][2]).toBeNull(); // c2
      expect(INITIAL_POSITION[1][3]).toBeNull(); // d2

      // Rank 3 (index 2) should be completely empty
      INITIAL_POSITION[2].forEach(square => {
        expect(square).toBeNull();
      });

      // Rank 4 (index 3) should have piece only on b4, others null
      expect(INITIAL_POSITION[3][0]).toBeNull(); // a4
      expect(INITIAL_POSITION[3][2]).toBeNull(); // c4
      expect(INITIAL_POSITION[3][3]).toBeNull(); // d4

      // Rank 5 (index 4) should have pieces only on a5, b5, c5, d5
    });

    test('should have exactly 6 pieces total (3 white, 3 black)', () => {
      let whiteCount = 0;
      let blackCount = 0;
      let totalPieces = 0;

      for (let rank = 0; rank < 5; rank++) {
        for (let file = 0; file < 4; file++) {
          const square = INITIAL_POSITION[rank][file];
          if (square !== null) {
            totalPieces++;
            if (square.color === 'white') {
              whiteCount++;
            } else if (square.color === 'black') {
              blackCount++;
            }
          }
        }
      }

      expect(totalPieces).toBe(10); // 5 white + 5 black pieces
      expect(whiteCount).toBe(5);
      expect(blackCount).toBe(5);
    });
  });
});