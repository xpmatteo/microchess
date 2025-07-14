// ABOUTME: Game constants and enumerations for microchess
// ABOUTME: Defines reusable constants to avoid magic strings throughout the codebase

/**
 * Game status constants
 */
export const GAME_STATUS = {
    PLAYING: 'playing',
    CHECKMATE: 'checkmate',
    STALEMATE: 'stalemate',
    RESIGNED: 'resigned'
};

/**
 * Player colors
 */
export const COLORS = {
    WHITE: 'white',
    BLACK: 'black'
};

/**
 * Display names for UI
 */
export const DISPLAY_NAMES = {
    WHITE: 'White',
    BLACK: 'Black'
};

/**
 * Board dimensions for 4x5 microchess board
 */
export const BOARD_RANKS = 5;  // Number of ranks (rows) on the board
export const BOARD_FILES = 4;  // Number of files (columns) on the board