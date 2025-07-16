// ABOUTME: AI evaluation engine for microchess with position scoring and material counting
// ABOUTME: Implements evaluation function for piece values, mobility, pawn structure, and king safety

import { BOARD_RANKS, BOARD_FILES, COLORS, GAME_STATUS } from './constants.js';

/**
 * Piece values for evaluation
 */
export const PIECE_VALUES = {
    K: 20000, // King
    Q: 9,     // Queen
    R: 5,     // Rook
    B: 3,     // Bishop
    N: 3,     // Knight
    P: 1      // Pawn
};

/**
 * Count material value for a given color
 */
export function countMaterial(board, color) {
    let materialValue = 0;
    
    for (let rank = 0; rank < BOARD_RANKS; rank++) {
        for (let file = 0; file < BOARD_FILES; file++) {
            const piece = board[rank][file];
            if (piece && piece.color === color && piece.piece !== 'K') {
                materialValue += PIECE_VALUES[piece.piece];
            }
        }
    }
    
    return materialValue;
}

/**
 * Evaluate pawn structure for advancement bonuses
 */
export function evaluatePawnStructure(board, color) {
    let pawnScore = 0;
    
    for (let rank = 0; rank < BOARD_RANKS; rank++) {
        for (let file = 0; file < BOARD_FILES; file++) {
            const piece = board[rank][file];
            if (piece && piece.color === color && piece.piece === 'P') {
                // Calculate advancement bonus based on how far the pawn has moved
                if (color === 'white') {
                    // White pawns start on rank 1, advancement = rank - 1
                    const advancement = rank - 1;
                    if (advancement > 0) {
                        pawnScore += advancement * 0.1; // Bonus for advanced pawns
                    }
                } else {
                    // Black pawns start on rank 3, advancement = 3 - rank
                    const advancement = 3 - rank;
                    if (advancement > 0) {
                        pawnScore += advancement * 0.1; // Bonus for advanced pawns
                    }
                }
            }
        }
    }
    
    return pawnScore;
}

/**
 * Evaluate king safety (penalty for exposed king)
 */
export function evaluateKingSafety(board, color) {
    // Find the king
    for (let rank = 0; rank < BOARD_RANKS; rank++) {
        for (let file = 0; file < BOARD_FILES; file++) {
            const piece = board[rank][file];
            if (piece && piece.color === color && piece.piece === 'K') {
                // Penalty for being in the center (exposed)
                // Center squares are around (2,1) and (2,2) for 4x5 board
                const centerDistance = Math.abs(rank - 2) + Math.abs(file - 1.5);
                
                if (centerDistance < 2) {
                    return -0.5; // Penalty for exposed king
                } else {
                    return 0; // Safe king position
                }
            }
        }
    }
    
    return 0; // No king found (shouldn't happen in normal game)
}

/**
 * Evaluate a position from the perspective of the given color
 * Returns positive values for advantage, negative for disadvantage
 */
export function evaluatePosition(board, color) {
    const opponentColor = color === 'white' ? 'black' : 'white';
    
    // Material difference (most important factor)
    const ourMaterial = countMaterial(board, color);
    const opponentMaterial = countMaterial(board, opponentColor);
    const materialDifference = ourMaterial - opponentMaterial;
    
    // Positional factors
    const ourPawnStructure = evaluatePawnStructure(board, color);
    const opponentPawnStructure = evaluatePawnStructure(board, opponentColor);
    const pawnStructureDifference = ourPawnStructure - opponentPawnStructure;
    
    const ourKingSafety = evaluateKingSafety(board, color);
    const opponentKingSafety = evaluateKingSafety(board, opponentColor);
    const kingSafetyDifference = ourKingSafety - opponentKingSafety;
    
    // Center control bonus (simple implementation)
    const centerControlBonus = evaluateCenterControl(board, color);
    
    // Combine all factors
    return materialDifference + pawnStructureDifference + kingSafetyDifference + centerControlBonus;
}

/**
 * Evaluate center control for the given color
 */
function evaluateCenterControl(board, color) {
    let centerControl = 0;
    
    // Check if pieces are controlling central squares
    for (let rank = 0; rank < BOARD_RANKS; rank++) {
        for (let file = 0; file < BOARD_FILES; file++) {
            const piece = board[rank][file];
            if (piece && piece.color === color) {
                // Bonus for pieces in or near center
                const centerDistance = Math.abs(rank - 2) + Math.abs(file - 1.5);
                if (centerDistance <= 2) {
                    centerControl += 0.1; // Small bonus for center control
                }
            }
        }
    }
    
    return centerControl;
}

/**
 * Get all legal moves for a color
 */
function getAllLegalMoves(gameState, color) {
    const moves = [];
    
    for (let rank = 0; rank < BOARD_RANKS; rank++) {
        for (let file = 0; file < BOARD_FILES; file++) {
            const piece = gameState.getPieceAt(rank, file);
            if (piece && piece.color === color) {
                const validMoves = gameState.getValidMovesForPiece(rank, file);
                moves.push(...validMoves);
            }
        }
    }
    
    return moves;
}

/**
 * Order moves to improve alpha-beta pruning efficiency
 * Prioritizes captures and checks
 */
function orderMoves(gameState, moves) {
    return moves.sort((a, b) => {
        // Prioritize captures (moves to squares with enemy pieces)
        const targetA = gameState.getPieceAt(a.toRank, a.toFile);
        const targetB = gameState.getPieceAt(b.toRank, b.toFile);
        
        if (targetA && !targetB) return -1; // A is capture, B is not
        if (!targetA && targetB) return 1;  // B is capture, A is not
        
        // If both are captures, prioritize higher-value captures
        if (targetA && targetB) {
            const valueA = PIECE_VALUES[targetA.piece];
            const valueB = PIECE_VALUES[targetB.piece];
            return valueB - valueA;
        }
        
        // No special ordering for non-captures
        return 0;
    });
}

/**
 * Minimax algorithm with alpha-beta pruning
 * @param {GameState} gameState - Current game state
 * @param {number} depth - Search depth remaining
 * @param {number} alpha - Alpha value for pruning
 * @param {number} beta - Beta value for pruning
 * @param {boolean} maximizingPlayer - True if maximizing player's turn
 * @returns {number} - Evaluation score
 */
export function minimax(gameState, depth, alpha, beta, maximizingPlayer) {
    const currentColor = gameState.getCurrentTurn();
    const gameStatus = gameState.getGameStatus();
    
    // Terminal cases
    if (gameStatus === GAME_STATUS.CHECKMATE) {
        // If it's checkmate, the current player has lost
        // Return a score that depends on depth to prefer quicker mates
        return maximizingPlayer ? (-50000 + depth) : (50000 - depth);
    }
    
    if (gameStatus === GAME_STATUS.STALEMATE) {
        return 0; // Draw
    }
    
    // Depth limit reached - evaluate position
    if (depth === 0) {
        // Evaluate from the perspective of the maximizing player
        const evalColor = maximizingPlayer ? COLORS.WHITE : COLORS.BLACK;
        return evaluatePosition(gameState.getBoard(), evalColor);
    }
    
    const moves = getAllLegalMoves(gameState, currentColor);
    
    // No moves available (shouldn't happen with game status check above)
    if (moves.length === 0) {
        return 0;
    }
    
    // Order moves for better pruning
    const orderedMoves = orderMoves(gameState, moves);
    
    if (maximizingPlayer) {
        let maxEval = -Infinity;
        
        for (const move of orderedMoves) {
            // Make move
            const success = gameState.executeMove(move);
            if (!success) continue;
            
            // Recursive call
            const eval_ = minimax(gameState, depth - 1, alpha, beta, false);
            
            // Undo move
            gameState.undoLastMove();
            
            maxEval = Math.max(maxEval, eval_);
            alpha = Math.max(alpha, eval_);
            
            // Beta cutoff
            if (beta <= alpha) {
                break;
            }
        }
        
        return maxEval;
    } else {
        let minEval = Infinity;
        
        for (const move of orderedMoves) {
            // Make move
            const success = gameState.executeMove(move);
            if (!success) continue;
            
            // Recursive call
            const eval_ = minimax(gameState, depth - 1, alpha, beta, true);
            
            // Undo move
            gameState.undoLastMove();
            
            minEval = Math.min(minEval, eval_);
            beta = Math.min(beta, eval_);
            
            // Alpha cutoff
            if (beta <= alpha) {
                break;
            }
        }
        
        return minEval;
    }
}

/**
 * Get the best move for the current player
 * @param {GameState} gameState - Current game state
 * @param {number} depth - Search depth
 * @returns {Object|null} - Best move or null if no moves available
 */
export function getBestMove(gameState, depth) {
    const currentColor = gameState.getCurrentTurn();
    const moves = getAllLegalMoves(gameState, currentColor);
    
    if (moves.length === 0) {
        return null;
    }
    
    // Order moves for better pruning
    const orderedMoves = orderMoves(gameState, moves);
    
    let bestMove = null;
    let bestEval = -Infinity;
    
    for (const move of orderedMoves) {
        // Make move
        const success = gameState.executeMove(move);
        if (!success) continue;
        
        // Evaluate position (from opponent's perspective, so negate)
        const eval_ = -minimax(gameState, depth - 1, -Infinity, Infinity, false);
        
        // Undo move
        gameState.undoLastMove();
        
        if (eval_ > bestEval) {
            bestEval = eval_;
            bestMove = move;
        }
    }
    
    return bestMove;
}