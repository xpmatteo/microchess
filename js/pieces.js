// ABOUTME: Defines chess piece symbols and initial microchess board position
// ABOUTME: Exports Unicode piece symbols and starting position for 4x5 microchess variant

export const PIECE_SYMBOLS = {
    white: {
        K: '♔', // King
        Q: '♕', // Queen
        R: '♖', // Rook
        B: '♗', // Bishop
        N: '♘', // Knight
        P: '♙'  // Pawn
    },
    black: {
        K: '♚', // King
        Q: '♛', // Queen
        R: '♜', // Rook
        B: '♝', // Bishop
        N: '♞', // Knight
        P: '♟'  // Pawn
    }
};

// Microchess initial position (5 ranks, 4 files)
// Board indexed as [rank][file] where rank 0 = rank 1, file 0 = file a
export const INITIAL_POSITION = [
    // Rank 1 (white back rank)
    [
        { piece: 'R', color: 'white' }, // a1
        { piece: 'N', color: 'white' }, // b1
        { piece: 'B', color: 'white' }, // c1
        { piece: 'K', color: 'white' }  // d1
    ],
    // Rank 2
    [
        null,                           // a2
        { piece: 'P', color: 'white' }, // b2
        null,                           // c2
        null                            // d2
    ],
    // Rank 3 (empty)
    [
        null, // a3
        null, // b3
        null, // c3
        null  // d3
    ],
    // Rank 4
    [
        null,                           // a4
        { piece: 'P', color: 'black' }, // b4
        null,                           // c4
        null                            // d4
    ],
    // Rank 5 (black back rank)
    [
        { piece: 'R', color: 'black' }, // a5
        { piece: 'N', color: 'black' }, // b5
        { piece: 'B', color: 'black' }, // c5
        { piece: 'K', color: 'black' }  // d5
    ]
];