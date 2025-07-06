# Microchess Game Specification

## Overview
A web-based microchess game where a human player competes against an AI opponent. Microchess is played on a 4x5 board (4 files, 5 ranks) with no queen and only one pawn per side.

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

## Game Rules
- 4x5 board (4 files: a-d, 5 ranks: 1-5)
- No queen in starting position
- Only one pawn per side
- No castling
- Pawns cannot move two squares initially
- Pawns can promote to any piece (including queen)
- Standard chess rules otherwise apply

## Board Setup
Starting position (white on bottom):
```
Black: Rook, Bishop, Knight, King (rank 5)
Black: Pawn (rank 4)
Empty squares (ranks 3 and 2)
White: Pawn (rank 2)
White: Rook, Bishop, Knight, King (rank 1)
```

## User Interface

### Visual Design
- Traditional chess board with alternating light/dark squares
- Chess piece symbols (Unicode chess symbols)
- 4x5 grid layout
- White pieces on bottom, black on top

### Board Interaction
1. Click piece to select (highlights valid moves)
2. Click destination square to complete move
3. Invalid clicks are ignored

### UI Elements
- Game board (primary focus)
- Turn indicator ("White to move" / "Black to move")
- Game status messages (check, checkmate, stalemate)
- Game controls:
  - New Game button
  - Resign button
  - Hint button

### Hint System
- Available only during human's turn
- Uses minimax algorithm with reduced depth
- Displays suggestion as text: "Suggest: [piece] to [square]"

## Game Flow

### Game Initialization
- Game starts automatically with human as white
- AI plays black
- Board displays starting position

### Turn Management
- Human always moves first when playing white
- When AI plays white, it moves immediately after game start
- Turns alternate between human and AI

### AI Behavior
- Uses minimax algorithm with lookahead depth
- Minimum 0.5 second delay before making moves
- Visual indication of AI move (highlight moved piece/squares)
- Sensible default piece values and positional evaluation

### Color Alternation
- First game: Human = White, AI = Black
- After game ends: Human = Black, AI = White
- Continue alternating for subsequent games

### Game End Conditions
- Checkmate: Game ends, winner declared
- Stalemate: Game ends, draw declared
- Resignation: Game ends, opponent wins
- After game ends, board remains visible until "New Game" clicked

## Move Validation

### Legal Move Enforcement
- Only allow moves that follow chess rules
- Ignore clicks on empty squares or opponent pieces
- Allow moves that put own king in check (user's responsibility)

### Special Rules
- No castling (not applicable in microchess)
- No en passant (only one pawn per side)
- Pawn promotion: prompt user to select piece type

## Data Persistence

### LocalStorage Usage
- Save game state after every human move
- Save game state after every AI response
- Persist color alternation between games
- Clear game state when new game starts
- No persistence of statistics or settings

### Saved State Structure
```javascript
{
  board: [...],           // Current board position
  currentTurn: 'white',   // Current player
  humanColor: 'white',    // Human's current color
  gameStatus: 'active',   // active, check, checkmate, stalemate
  moveHistory: [...],     // Move history
  lastMove: {...}         // Last move for highlighting
}
```

## AI Implementation

### Minimax Algorithm
- Primary AI uses minimax with alpha-beta pruning
- Lookahead depth: 3-4 levels (adjustable)
- Hint system uses same algorithm with reduced depth (1-2 levels)

### Evaluation Function
- Piece values (default weights):
  - King: 1000
  - Rook: 5
  - Bishop: 3
  - Knight: 3
  - Pawn: 1
- Positional factors:
  - King safety
  - Piece mobility
  - Pawn advancement
  - Center control

### Performance Considerations
- Implement alpha-beta pruning for efficiency
- Use iterative deepening if needed
- Cache evaluation results where possible

## Error Handling

### Invalid Moves
- Silently ignore clicks on invalid squares
- No error messages for invalid moves
- Prevent illegal moves through UI logic

### Edge Cases
- Handle pawn promotion dialog
- Detect and announce check/checkmate/stalemate
- Graceful handling of corrupted localStorage data

## User Experience

### Visual Feedback
- Highlight selected piece
- Show valid moves when piece selected
- Highlight AI's last move
- Clear visual distinction between game states

### Timing
- AI minimum move delay: 0.5 seconds
- No artificial delays for human moves
- Smooth transitions between game states

## Browser Compatibility
- Modern browsers supporting ES6+ modules
- LocalStorage API support
- CSS Grid/Flexbox support for layout

## Future Extensibility
- Modular design allows for:
  - Multiple AI difficulty levels
  - Different evaluation parameters
  - Additional game statistics
  - Sound effects
  - Move animation