// ABOUTME: Move validation engine for microchess game with piece movement rules
// ABOUTME: Handles legal move validation, path checking, and possible move generation

/**
 * Check if a path between two squares is clear (no pieces blocking)
 */
export function isPathClear(board, from, to) {
    const rankDiff = to.rank - from.rank;
    const fileDiff = to.file - from.file;
    
    // Calculate step direction
    const rankStep = rankDiff === 0 ? 0 : rankDiff / Math.abs(rankDiff);
    const fileStep = fileDiff === 0 ? 0 : fileDiff / Math.abs(fileDiff);
    
    // Check each square along the path (excluding start and end)
    let currentRank = from.rank + rankStep;
    let currentFile = from.file + fileStep;
    
    while (currentRank !== to.rank || currentFile !== to.file) {
        if (board[currentRank][currentFile] !== null) {
            return false;
        }
        currentRank += rankStep;
        currentFile += fileStep;
    }
    
    return true;
}

/**
 * Check if a square is attacked by the opposing color
 */
export function isSquareAttacked(board, square, attackingColor) {
    // For now, just return false - will implement later when needed for check detection
    return false;
}

/**
 * Validate if a move is legal for a specific piece
 */
export function isValidMove(board, from, to, piece, color) {
    // Basic boundary checks
    if (to.rank < 0 || to.rank >= 5 || to.file < 0 || to.file >= 4) {
        return false;
    }
    
    // Can't move to same square
    if (from.rank === to.rank && from.file === to.file) {
        return false;
    }
    
    // Can't capture own piece
    const targetSquare = board[to.rank][to.file];
    if (targetSquare !== null && targetSquare.color === color) {
        return false;
    }
    
    // Check piece-specific move rules
    switch (piece) {
        case 'R':
            return isValidRookMove(board, from, to);
        case 'B':
            return isValidBishopMove(board, from, to);
        case 'N':
            return isValidKnightMove(board, from, to);
        case 'K':
            return isValidKingMove(board, from, to);
        case 'P':
            return isValidPawnMove(board, from, to, color);
        default:
            return false;
    }
}

/**
 * Validate rook moves (horizontal and vertical)
 */
function isValidRookMove(board, from, to) {
    // Must be horizontal or vertical
    if (from.rank !== to.rank && from.file !== to.file) {
        return false;
    }
    
    // Path must be clear
    return isPathClear(board, from, to);
}

/**
 * Validate bishop moves (diagonal)
 */
function isValidBishopMove(board, from, to) {
    const rankDiff = Math.abs(to.rank - from.rank);
    const fileDiff = Math.abs(to.file - from.file);
    
    // Must be diagonal (equal rank and file differences)
    if (rankDiff !== fileDiff) {
        return false;
    }
    
    // Path must be clear
    return isPathClear(board, from, to);
}

/**
 * Validate knight moves (L-shape)
 */
function isValidKnightMove(board, from, to) {
    const rankDiff = Math.abs(to.rank - from.rank);
    const fileDiff = Math.abs(to.file - from.file);
    
    // Must be L-shaped move (2+1 or 1+2)
    return (rankDiff === 2 && fileDiff === 1) || (rankDiff === 1 && fileDiff === 2);
}

/**
 * Validate king moves (one square in any direction)
 */
function isValidKingMove(board, from, to) {
    const rankDiff = Math.abs(to.rank - from.rank);
    const fileDiff = Math.abs(to.file - from.file);
    
    // Must be one square in any direction
    return rankDiff <= 1 && fileDiff <= 1;
}

/**
 * Validate pawn moves (forward one square, diagonal capture)
 */
function isValidPawnMove(board, from, to, color) {
    const rankDirection = color === 'white' ? 1 : -1;
    const rankDiff = to.rank - from.rank;
    const fileDiff = Math.abs(to.file - from.file);
    
    // Forward one square
    if (fileDiff === 0 && rankDiff === rankDirection) {
        // Must be empty square
        return board[to.rank][to.file] === null;
    }
    
    // Diagonal capture
    if (fileDiff === 1 && rankDiff === rankDirection) {
        // Must be enemy piece
        const targetSquare = board[to.rank][to.file];
        return targetSquare !== null && targetSquare.color !== color;
    }
    
    return false;
}

/**
 * Get all possible moves for a piece at a given position
 */
export function getPossibleMoves(board, position, piece, color) {
    const moves = [];
    
    // Check all squares on the board
    for (let rank = 0; rank < 5; rank++) {
        for (let file = 0; file < 4; file++) {
            const to = { rank, file };
            if (isValidMove(board, position, to, piece, color)) {
                moves.push(to);
            }
        }
    }
    
    return moves;
}