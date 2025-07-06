# Microchess Game Specification

## Overview
A web-based microchess game where a human player competes against an AI opponent. Microchess is played on a 4x5 board (4 files, 5 ranks) with no queen in the initial setup and only one pawn per side.

## Technical Architecture

### Technology Stack
- Pure HTML/CSS/JavaScript (vanilla JS)
- Modern ES6+ modules
- Model-View-Controller (MVC) architecture

### File Structure
```
index.html
style.css
js/
  ├── game.js          (Game model - game state, rules, move validation)
  ├── ai.js            (AI logic - minimax algorithm, evaluation)
  ├── ui.js            (View - DOM manipulation, user interaction)
  ├── controller.js    (Controller - coordinates model and view)
  └── storage.js       (LocalStorage handling)
```

## Game Rules (per Glimne 1997)
- 4x5 board (4 files: a-d, 5 ranks: 1-5)
- No queen in starting position
- Only one pawn per side
- No castling
- Pawns have no double-move option (cannot move two squares on first move)
- Pawns can promote to any of the four standard pieces (Rook, Knight, Bishop, Queen)
- Standard chess rules otherwise apply (including en passant if applicable)

## Board Setup
Starting position (white on bottom):
```
Rank 5: r n b k  (Black: Rook a5, Knight b5, Bishop c5, King d5)
Rank 4: . p . .  (Black: Pawn b4)
Rank 3: . . . .  (Empty)
Rank 2: . P . .  (White: Pawn b2)
Rank 1: R N B K  (White: Rook a1, Knight b1, Bishop c1, King d1)
        a b c d
```

## User Interface

### Visual Design
- Traditional chess board with alternating light/dark squares
- Chess piece symbols (Unicode chess symbols: ♔♕♖♗♘♙ for white, ♚♛♜♝♞♟ for black)
- 4x5 grid layout with file (a-d) and rank (1-5) labels
- White pieces on bottom, black on top

### Board Interaction
1. Click piece to select (highlights valid moves)
2. Click destination square to complete move
3. Click another piece to change selection
4. Click selected piece to deselect
5. Invalid clicks are ignored

### UI Elements
- Game board (primary focus)
- Turn indicator ("White to move" / "Black to move")
- Game status messages (check, checkmate, stalemate)
- Game controls:
  - New Game button
  - Resign button
  - Hint button
- Move history display (optional, shows algebraic notation)

### Hint System
- Available only during human's turn
- Uses minimax algorithm with reduced depth (1-2 levels)
- Displays suggestion as text: "Suggest: [move in algebraic notation]"
- Visual indication on board (subtle highlight of suggested from/to squares)

## Game Flow

### Game Initialization
- Game starts automatically with human as white
- AI plays black
- Board displays starting position
- Turn indicator shows "White to move"

### Turn Management
- Human always moves first when playing white
- When AI plays white, it moves immediately after game start
- Turns alternate between human and AI
- Invalid move attempts don't change turn

### AI Behavior
- Uses minimax algorithm with alpha-beta pruning
- Default lookahead depth: 3-4 levels
- Minimum 0.5 second delay before making moves (for better UX)
- Visual indication of AI move (brief highlight of moved piece/squares)
- Randomization between equally valued moves to avoid repetitive play

### Color Alternation
- First game: Human = White, AI = Black
- After game ends: Colors swap automatically
- Continue alternating for each new game
- Color preference persisted in localStorage

### Game End Conditions
- Checkmate: Game ends, winner declared with modal/message
- Stalemate: Game ends, draw declared
- Resignation: Game ends, opponent wins
- After game ends, board remains interactive for review until "New Game" clicked

## Move Validation

### Legal Move Enforcement
- Validate all moves according to chess rules
- Prevent moves that leave own king in check
- Highlight king when in check
- Show legal moves only (no illegal move highlighting)

### Special Rules Implementation
- **En passant**: Since there's only one pawn per side, en passant is possible but rare
  - Track pawn double moves (not applicable in microchess since pawns can't double move)
  - Actually, en passant is impossible in microchess due to single-square pawn moves
- **Pawn promotion**: 
  - Automatic promotion dialog when pawn reaches last rank
  - Options: Queen, Rook, Bishop, Knight
  - Game pauses until selection made

## Data Persistence

### LocalStorage Usage
- Save game state after every move (human or AI)
- Persist color preference between sessions
- Save incomplete games for resumption
- Store game history (last N games)
- Clear only current game when "New Game" clicked

### Saved State Structure
```javascript
{
  currentGame: {
    board: [...],           // 2D array of board state
    currentTurn: 'white',   // Current player
    humanColor: 'white',    // Human's color this game
    gameStatus: 'active',   // active, check, checkmate, stalemate, resigned
    moveHistory: [...],     // Array of moves in algebraic notation
    lastMove: {             // For highlighting
      from: {file: 'a', rank: 1},
      to: {file: 'a', rank: 2},
      piece: 'R'
    },
    enPassantTarget: null   // Not used in microchess
  },
  preferences: {
    nextHumanColor: 'black' // For color alternation
  },
  gameHistory: [...]        // Optional: store completed games
}
```

## AI Implementation

### Minimax Algorithm
- Minimax with alpha-beta pruning
- Default depth: 4 levels (adjustable based on performance)
- Hint system uses depth 2 for faster response
- Quiescence search for captures at leaf nodes

### Evaluation Function
- **Material values**:
  - King: 20000 (essentially infinite)
  - Queen: 9
  - Rook: 5
  - Bishop: 3
  - Knight: 3
  - Pawn: 1

- **Positional factors**:
  - King safety (distance from center in endgame, protection in midgame)
  - Piece mobility (number of legal moves)
  - Pawn advancement (bonus for advanced pawns)
  - Center control (slight bonus for central squares)
  - Piece-specific positioning:
    - Knights prefer center
    - Bishops prefer open diagonals
    - Rooks prefer open files
    - King prefers safety early, activity late

### Performance Optimizations
- Move ordering (captures, checks, then quiet moves)
- Transposition table for position caching
- Iterative deepening for time management
- Killer move heuristic
- History heuristic for move ordering

## Error Handling

### User Errors
- Invalid piece selection: no error, just ignore
- Invalid move attempt: no error, maintain selection
- Clicking during AI turn: queue or ignore clicks

### System Errors
- Corrupted localStorage: detect and reset to new game
- Invalid board state: offer to start new game
- AI timeout: make random legal move as fallback

## User Experience

### Visual Feedback
- Selected piece: bright border or background
- Valid moves: subtle dot or highlight on destination squares
- Last move: different highlight color for from/to squares
- Check indication: red highlight on king
- Hover effects on pieces and valid move squares

### Animation (optional but recommended)
- Smooth piece movement (CSS transitions)
- Capture animation (fade out captured piece)
- Check/checkmate pulse effect
- Promotion dialog appearance

### Timing
- AI move delay: 0.5-1.5 seconds (varies for realism)
- Animation duration: 200-300ms
- No delays for human moves
- Instant feedback for piece selection

### Accessibility
- Keyboard navigation support
- Screen reader friendly (ARIA labels)
- High contrast mode option
- Move announcement for screen readers

## Browser Compatibility
- Modern browsers (Chrome 60+, Firefox 60+, Safari 12+, Edge 79+)
- ES6+ module support required
- LocalStorage API support
- CSS Grid/Flexbox support
- Touch device support (mobile friendly)

## Testing Considerations
- Unit tests for move validation
- AI vs AI games for logic verification
- Position puzzles for checkmate scenarios
- Performance benchmarks for AI depth

## Future Extensibility
The modular design allows for:
- Multiple AI difficulty levels
- Opening book implementation
- Endgame tablebase support
- Time controls
- Online multiplayer
- Different board themes
- Sound effects and music
- Move notation export (PGN format)
- Analysis mode
- Puzzle mode
- Tournament mode with ELO ratings