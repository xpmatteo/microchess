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