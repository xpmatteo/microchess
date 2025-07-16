// ABOUTME: Debug test to see what moves AI is actually making in failed test cases
// ABOUTME: Analyzes specific positions where AI fails to make expected moves

import { GameState } from './gameState.js';
import { getBestMove, evaluatePosition } from './ai.js';
import { COLORS } from './constants.js';

describe.skip('AI Debug Analysis - SKIPPED (Diagnostic tests)', () => {
    let gameState;
    
    beforeEach(() => {
        gameState = new GameState();
    });

    function setupPosition(setup, turn = COLORS.WHITE) {
        const emptyBoard = Array(5).fill(null).map(() => Array(4).fill(null));
        gameState.board = emptyBoard;
        
        setup.forEach(({piece, color, rank, file}) => {
            gameState.board[rank][file] = {piece, color};
        });
        
        gameState.setCurrentTurn(turn);
    }

    function debugPosition(testName, setup, turn, expectedMove) {
        console.log(`\n=== DEBUG: ${testName} ===`);
        setupPosition(setup, turn);
        
        // Print board
        console.log('Board position:');
        for (let rank = 4; rank >= 0; rank--) {
            let row = `${rank}: `;
            for (let file = 0; file < 4; file++) {
                const piece = gameState.board[rank][file];
                if (piece) {
                    const symbol = piece.color === 'white' ? piece.piece : piece.piece.toLowerCase();
                    row += `${symbol} `;
                } else {
                    row += '. ';
                }
            }
            console.log(row);
        }
        console.log('   a b c d');
        console.log(`Turn: ${turn}`);
        
        // Get AI move
        const bestMove = getBestMove(gameState, 3);
        console.log(`AI chose: ${bestMove ? `${String.fromCharCode(97 + bestMove.fromFile)}${bestMove.fromRank + 1} -> ${String.fromCharCode(97 + bestMove.toFile)}${bestMove.toRank + 1}` : 'null'}`);
        if (expectedMove) {
            console.log(`Expected: ${String.fromCharCode(97 + expectedMove.fromFile)}${expectedMove.fromRank + 1} -> ${String.fromCharCode(97 + expectedMove.toFile)}${expectedMove.toRank + 1}`);
        }
        
        // Show evaluation
        const eval1 = evaluatePosition(gameState.getBoard(), turn);
        console.log(`Position evaluation for ${turn}: ${eval1}`);
        
        return bestMove;
    }

    test('Debug: AI must avoid losing queen for pawn', () => {
        const setup = [
            {piece: 'K', color: COLORS.WHITE, rank: 0, file: 0},
            {piece: 'P', color: COLORS.WHITE, rank: 2, file: 1}, // Attacking queen
            {piece: 'K', color: COLORS.BLACK, rank: 4, file: 3},
            {piece: 'Q', color: COLORS.BLACK, rank: 3, file: 2}  // Attacked queen
        ];
        
        const bestMove = debugPosition(
            'AI must avoid losing queen for pawn', 
            setup, 
            COLORS.BLACK,
            {fromRank: 3, fromFile: 2, toRank: 2, toFile: 2} // Expected queen move
        );
        
        expect(bestMove).not.toBeNull();
    });

    test('Debug: AI must deliver mate in 1', () => {
        const setup = [
            {piece: 'K', color: COLORS.WHITE, rank: 0, file: 0},
            {piece: 'Q', color: COLORS.WHITE, rank: 3, file: 1}, // Can deliver mate
            {piece: 'K', color: COLORS.BLACK, rank: 4, file: 1}, // Trapped king
            {piece: 'R', color: COLORS.BLACK, rank: 4, file: 0}, // Blocks escape
            {piece: 'R', color: COLORS.BLACK, rank: 4, file: 2}  // Blocks escape
        ];
        
        const bestMove = debugPosition(
            'AI must deliver mate in 1', 
            setup, 
            COLORS.WHITE,
            {fromRank: 3, fromFile: 1, toRank: 4, toFile: 1} // Expected mate move
        );
        
        expect(bestMove).not.toBeNull();
    });

    test('Debug: AI should centralize pieces', () => {
        const setup = [
            {piece: 'K', color: COLORS.WHITE, rank: 0, file: 0},
            {piece: 'P', color: COLORS.WHITE, rank: 1, file: 1},
            {piece: 'K', color: COLORS.BLACK, rank: 4, file: 3},
            {piece: 'N', color: COLORS.BLACK, rank: 4, file: 1}  // Knight can centralize
        ];
        
        const bestMove = debugPosition(
            'AI should centralize pieces', 
            setup, 
            COLORS.BLACK,
            {fromRank: 4, fromFile: 1, toRank: 2, toFile: 2} // Expected central move
        );
        
        expect(bestMove).not.toBeNull();
    });

    test('Debug: AI should push passed pawn', () => {
        const setup = [
            {piece: 'K', color: COLORS.WHITE, rank: 0, file: 0},
            {piece: 'K', color: COLORS.WHITE, rank: 2, file: 1},
            {piece: 'P', color: COLORS.WHITE, rank: 3, file: 2}, // Passed pawn
            {piece: 'K', color: COLORS.BLACK, rank: 4, file: 0}  // Black king too far
        ];
        
        const bestMove = debugPosition(
            'AI should push passed pawn', 
            setup, 
            COLORS.WHITE,
            {fromRank: 3, fromFile: 2, toRank: 4, toFile: 2} // Expected pawn push
        );
        
        expect(bestMove).not.toBeNull();
    });

    test('Debug: Show all legal moves for critical position', () => {
        // The "avoid losing queen" position - let's see all possible moves
        setupPosition([
            {piece: 'K', color: COLORS.WHITE, rank: 0, file: 0},
            {piece: 'P', color: COLORS.WHITE, rank: 2, file: 1}, // Attacking queen
            {piece: 'K', color: COLORS.BLACK, rank: 4, file: 3},
            {piece: 'Q', color: COLORS.BLACK, rank: 3, file: 2}  // Attacked queen
        ], COLORS.BLACK);

        console.log('\n=== ALL LEGAL MOVES FOR BLACK ===');
        
        // Get all legal moves for black pieces
        for (let rank = 0; rank < 5; rank++) {
            for (let file = 0; file < 4; file++) {
                const piece = gameState.getPieceAt(rank, file);
                if (piece && piece.color === COLORS.BLACK) {
                    const moves = gameState.getValidMovesForPiece(rank, file);
                    console.log(`${piece.piece} at ${String.fromCharCode(97 + file)}${rank + 1}: ${moves.length} moves`);
                    moves.forEach(move => {
                        console.log(`  -> ${String.fromCharCode(97 + move.toFile)}${move.toRank + 1}`);
                    });
                }
            }
        }
    });
});