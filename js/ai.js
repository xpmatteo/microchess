// ABOUTME: AI evaluation engine for microchess with position scoring and material counting
// ABOUTME: Implements evaluation function for piece values, mobility, pawn structure, and king safety

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
    
    for (let rank = 0; rank < 5; rank++) {
        for (let file = 0; file < 4; file++) {
            const piece = board[rank][file];
            if (piece && piece.color === color) {
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
    
    for (let rank = 0; rank < 5; rank++) {
        for (let file = 0; file < 4; file++) {
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
    for (let rank = 0; rank < 5; rank++) {
        for (let file = 0; file < 4; file++) {
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
    for (let rank = 0; rank < 5; rank++) {
        for (let file = 0; file < 4; file++) {
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