# Microchess Implementation Plan

## High-Level Blueprint

**ARCHITECTURE NOTE**: This implementation uses Model-View-Controller (MVC) pattern with constructor dependency injection throughout. This provides better separation of concerns, testability, and maintainability than the original procedural approach.

### Phase 1: Foundation (✅ Complete)
1. Project setup with HTML/CSS skeleton and MVC structure
2. Board representation and rendering with View layer
3. Basic piece placement with GameState model

### Phase 2: Game Logic (✅ Complete)
4. Move validation system with dedicated moves module
5. Game state management with proper state encapsulation
6. Turn management with controller coordination

### Phase 3: User Interaction (✅ Complete)
7. Click handling with MVC event flow
8. Enhanced visual feedback system with multiple highlights
9. Game status display with controller/view separation

### Phase 4: AI Implementation
10. Basic AI with evaluation ✅
10.5. **Code Quality & Performance Improvements** (Critical Refactoring)
11. Minimax algorithm
12. AI integration

### Phase 5: Polish
13. Local storage
14. Pawn promotion and polish features
15. Final integration and testing

## Architecture Pattern

### MVC with Dependency Injection

The implemented architecture follows strict MVC separation with constructor dependency injection:

**Model Layer (Business Logic)**:
- `gameState.js` - Core game state, move execution, check detection
- `moves.js` - Move validation engine
- `pieces.js` - Piece definitions and constants
- `storage.js` - Data persistence (localStorage)

**View Layer (DOM/UI)**:
- `view.js` - All DOM manipulation, rendering, visual feedback
- Receives DOM elements via constructor (no document.getElementById inside components)
- Methods: renderBoard(), renderPieces(), showLastMove(), showCheckWarning()

**Controller Layer (Coordination)**:
- `controller.js` - Coordinates between model and view
- Handles user events, orchestrates updates
- Receives GameState and View via constructor (pure dependency injection)

**Dependency Injection Container**:
- `game.js` - Creates and injects all dependencies
- Only component allowed to use document.getElementById()
- Wires together the entire application

**Key Principles**:
1. **Constructor Dependency Injection** - All components receive dependencies via constructor
2. **No Hidden Dependencies** - Components never create their own dependencies
3. **Testable Architecture** - Each layer can be unit tested in isolation
4. **Strict Separation** - Model never touches DOM, View never contains business logic

## Detailed Breakdown

### Phase 1: Foundation (Steps 1-3)

**Step 1: Project Setup**
- Create HTML structure with game container
- Set up CSS for basic layout
- Create JavaScript module structure
- Add board container element

**Step 2: Board Rendering**
- Create 4x5 grid with CSS
- Add square coloring (alternating)
- Add file/rank labels
- Implement responsive sizing

**Step 3: Piece Display**
- Define piece Unicode symbols
- Create board state representation
- Render pieces from board state
- Set up initial position

### Phase 2: Game Logic (Steps 4-6)

**Step 4: Move Generation**
- Implement piece move rules
- Create move validation for each piece type
- Add board boundary checking
- Test with unit tests

**Step 5: Game State Management**
- Track current position
- Implement move execution
- Add capture handling
- Detect check conditions

**Step 6: Game Flow**
- Implement turn switching
- Add checkmate detection
- Add stalemate detection
- Handle game end states

### Phase 3: User Interaction (Steps 7-9)

**Step 7: Click Handling**
- Add square click detection
- Implement piece selection
- Show valid moves
- Execute moves on valid clicks

**Step 8: Visual Feedback**
- Highlight selected piece
- Show valid move indicators
- Highlight last move
- Add check warning

**Step 9: UI Elements**
- Add turn indicator
- Show game status
- Add control buttons
- Implement resign functionality

### Phase 4: AI Implementation (Steps 10-12)

**Step 10: Evaluation Function** ✅
- Implement material counting
- Add positional evaluation
- Create board evaluation
- Test evaluation accuracy

**Step 10.5: Code Quality & Performance Improvements** (Critical Refactoring Before AI)
- **Performance**: Cache DOM elements, implement delta rendering, optimize highlights
- **Code Quality**: Add board dimension constants, fix DI violations, improve error handling
- **Architecture**: Consolidate redundant view calls, create unified selection methods
- **Verification**: Ensure all tests pass, measure performance improvements, no regressions

**Step 11: Minimax Algorithm**
- Implement basic minimax
- Add alpha-beta pruning
- Set search depth
- Add move ordering

**Step 12: AI Integration**
- Connect AI to game flow
- Add move delay
- Implement hint system
- Handle AI color switching

### Phase 5: Polish (Steps 13-15)

**Step 13: Persistence**
- Save game state
- Load saved games
- Track color preference
- Handle corrupt data

**Step 14: Enhanced Controls**
- Add new game functionality
- Implement pawn promotion UI
- Add keyboard shortcuts
- Polish animations

**Step 15: Final Testing**
- Integration testing
- Edge case handling
- Performance optimization
- Code cleanup

## Implementation Prompts

### Prompt 1: Project Foundation
```text
Create the foundation for a microchess game using vanilla JavaScript with ES6 modules. 

Set up:
1. An index.html with a game container div (id="game-container")
2. A style.css with basic reset and container styling
3. A js/game.js module that exports a Game class with an initialize() method
4. The Game class should have a board property that's a 2D array (5 rows, 4 columns)
5. Wire everything together in index.html with a script tag that imports and initializes the game

The board should be indexed as board[rank][file] where rank 0 is rank 1 (white's back rank) and file 0 is file 'a'.

Include basic error handling and console logging for initialization.
```

### Prompt 2: Board Rendering
```text
Extend the microchess game to render the board visually.

Add to the Game class:
1. A renderBoard() method that creates a 4x5 grid of div elements
2. Each square should have classes "square" and either "light" or "dark"
3. Squares should have data attributes data-file (0-3) and data-rank (0-4)
4. Add file labels (a-d) below the board and rank labels (1-5) to the left
5. Style the board with CSS: 80px squares, alternating colors (#f0d9b5 light, #b58863 dark)

The board should render with a1 as a dark square in the bottom-left corner.
Call renderBoard() from initialize().

Test by verifying the board displays correctly with proper square colors.
```

### Prompt 3: Initial Piece Placement
```text
Add chess pieces to the microchess board.

Create:
1. A js/pieces.js module that exports:
   - PIECE_SYMBOLS object mapping piece codes to Unicode symbols
   - INITIAL_POSITION constant with the starting board state
2. Update Game class to:
   - Import and use INITIAL_POSITION to set up the board
   - Add a renderPieces() method that places piece spans inside squares
   - Use data attributes to identify pieces (data-piece, data-color)

Initial position:
- White (rank 1): Rook-a1, Knight-b1, Bishop-c1, King-d1, Pawn-b2
- Black (rank 5): Rook-a5, Knight-b5, Bishop-c5, King-d5, Pawn-b4

Style pieces with CSS (font-size: 60px, centered in squares).
Test that all pieces appear in correct positions.
```

### Prompt 4: Move Validation Engine
```text
Implement move validation for all piece types in microchess.

Create js/moves.js module with:
1. isValidMove(board, from, to, piece, color) function
2. getPossibleMoves(board, position, piece, color) function
3. Individual validation functions for each piece type
4. Helper functions: isPathClear(), isSquareAttacked()

Rules to implement:
- Rook: horizontal/vertical, path must be clear
- Bishop: diagonal, path must be clear
- Knight: L-shape, can jump
- King: one square any direction
- Pawn: forward one square, diagonal capture, promotion at last rank

Include comprehensive unit tests for each piece type.
Export all validation functions.
```

### Prompt 5: Game State Management
```text
Implement game state management and move execution.

Create js/gameState.js module with:
1. GameState class that tracks:
   - Current board position
   - Current turn (white/black)
   - Last move made
   - Game status (active/check/checkmate/stalemate)
2. Methods:
   - makeMove(from, to): Execute move and update board
   - isInCheck(color): Detect if king is in check
   - getAllLegalMoves(color): Get all legal moves for a color
   - undoMove(): Revert last move (for AI search)

Integrate with Game class:
- Create gameState instance in constructor
- Update board from gameState after moves

Test check detection and move execution thoroughly.
```

### Prompt 6: Turn Management and Game End
```text
Implement turn management and game end detection.

Extend GameState class with:
1. switchTurn() method to alternate between players
2. isCheckmate(color) method checking for no legal moves + check
3. isStalemate(color) method checking for no legal moves + no check
4. getGameStatus() method returning current game state

Update Game class:
1. Add processMove(from, to) method that:
   - Validates the move
   - Executes if valid
   - Switches turns
   - Updates game status
2. Add getGameStatus() method
3. Block moves when game is over

Test checkmate and stalemate detection with specific positions.
```

### Prompt 7: User Interaction (MVC Implementation)
```text
Implement user interaction using MVC pattern with dependency injection.

Refactor Game class into MVC architecture:
1. Create js/controller.js with Controller class:
   - Constructor receives GameState and View dependencies
   - Properties: selectedSquare, manages user interaction state
   - Methods: handleSquareClick(), trySelectSquare(), tryMakeMove()
   - Coordinates between model (GameState) and view (View)

2. Create js/view.js with View class:
   - Constructor receives DOM elements (no document.getElementById inside)
   - Methods: renderBoard(), renderPieces(), setClickHandler()
   - All DOM manipulation and visual feedback

3. Refactor js/game.js as Dependency Injection Container:
   - Creates GameState, View with DOM elements, Controller
   - Injects dependencies: Controller(gameState, view)
   - Only class allowed to query DOM directly

Test piece selection and movement with proper MVC separation.
```

### Prompt 8: Enhanced Visual Feedback System
```text
Implement comprehensive visual feedback with multiple highlight types.

Add CSS classes and animations:
1. .selected: Orange background with glow for selected pieces
2. .valid-move: Green background with glow for valid moves
3. .last-move: Yellow background for from/to squares of last move
4. .in-check: Red background with animation for king in check

Extend GameState with visual feedback methods:
1. getLastMove(): Returns last move for highlighting
2. getKingInCheck(): Returns king position if current player in check

Extend View class with feedback methods:
1. showLastMove(fromRank, fromFile, toRank, toFile)
2. showCheckWarning(kingRank, kingFile)
3. clearHighlights(): Removes all highlight classes

Update Controller.updateView() to:
1. Show last move highlighting
2. Show check warnings
3. Maintain selected piece and valid moves
4. Coordinate all visual feedback

Test all visual feedback states and ensure proper layering.
```

### Prompt 9: Game Status and Controls (MVC Implementation)
```text
Implement game status display and controls using MVC pattern.

Extend View class with control methods:
1. setupControls(): Create New Game, Resign, Hint buttons
2. setButtonHandlers(): Accept handler functions from controller
3. updateStatus(statusText): Update status display
4. setControlsEnabled(enabled): Enable/disable buttons appropriately

Extend Controller class with control handlers:
1. handleNewGame(): Reset game state, update view, enable controls
2. handleResign(): Set game status to resigned, disable controls
3. handleHint(): Display hint message (placeholder for AI implementation)
4. updateStatus(): Generate status text based on game state

Update Controller.updateView() method:
1. Generate appropriate status messages
2. Handle different game states (playing, check, checkmate, stalemate, resigned)
3. Update status display via view

Ensure proper MVC separation:
- View handles DOM manipulation and styling
- Controller handles business logic and state management
- Clear separation of concerns

Test all control functionality and status displays.
```

### Prompt 10: Basic AI Evaluation
```text
Implement the AI evaluation function for microchess.

Create js/ai.js module with:
1. Piece values: King=20000, Queen=9, Rook=5, Bishop=3, Knight=3, Pawn=1
2. evaluatePosition(board, color) function that calculates:
   - Material difference
   - Piece mobility (number of legal moves)
   - Pawn advancement bonus
   - King safety (penalty for exposed king)
   - Center control bonus
3. Helper functions:
   - countMaterial(board, color)
   - evaluatePawnStructure(board, color)
   - evaluateKingSafety(board, color)

Export evaluation function.
Include unit tests for various positions.
```

### Prompt 11: Minimax Implementation
```text
Implement minimax algorithm with alpha-beta pruning.

Extend js/ai.js with:
1. minimax(gameState, depth, alpha, beta, maximizingPlayer) function
2. findBestMove(gameState, depth) function that:
   - Gets all legal moves
   - Evaluates each with minimax
   - Returns best move
3. Move ordering for efficiency:
   - Captures first
   - Checks second  
   - Center moves third
4. Add configurable depth (default 3)

Include performance optimizations:
- Alpha-beta pruning
- Early termination on checkmate
- Move ordering

Test with known positions and expected moves.
```

### Prompt 12: AI Integration
```text
Integrate AI into the game flow.

Update Game class:
1. Add properties:
   - humanColor (starts as 'white')
   - aiColor (starts as 'black')
   - isAIThinking flag
2. Add makeAIMove() method:
   - Set isAIThinking = true
   - Call AI findBestMove()
   - Add 500-1000ms delay
   - Execute move
   - Set isAIThinking = false
3. Update processMove() to trigger AI after human moves
4. Implement hint system:
   - Use depth 2 for hints
   - Show suggestion in status area

Block user input during AI thinking.
Test AI responses and hint functionality.
```

### Prompt 13: Local Storage
```text
Implement game persistence with localStorage.

Create js/storage.js module with Storage class:
1. saveGame(gameState, humanColor) method
2. loadGame() method returning saved state
3. clearGame() method
4. savePreferences(nextHumanColor) method
5. loadPreferences() method

Update Game class:
1. Save after every move (human and AI)
2. Load saved game on initialization
3. Clear on new game
4. Implement color alternation:
   - Save next human color after game ends
   - Load and apply on new game

Handle errors:
- Corrupt data: start new game
- Missing data: use defaults

Test save/load functionality and color alternation.
```

### Prompt 14: Pawn Promotion and Polish
```text
Implement pawn promotion and final UI polish.

Add pawn promotion:
1. Create promotion dialog UI:
   - Modal overlay
   - Four piece options (Q, R, B, N)
   - Click to select
2. Update move execution to detect promotion
3. Pause game until selection made
4. Update board with promoted piece

Polish features:
1. Add CSS transitions for piece movement (200ms)
2. Add hover effects on valid pieces
3. Implement keyboard shortcuts:
   - Escape: clear selection
   - N: new game
4. Add win/loss messages in modal

Test promotion in various scenarios.
Ensure smooth user experience.
```

### Prompt 15: Final Integration and Testing
```text
Complete final integration and comprehensive testing.

Integration tasks:
1. Ensure all modules work together seamlessly
2. Add error boundaries for graceful failures
3. Optimize performance:
   - Reduce redundant calculations
   - Cache DOM queries
   - Optimize render cycles
4. Code cleanup:
   - Remove console.logs
   - Add JSDoc comments
   - Ensure consistent code style

Testing checklist:
1. Test all piece movements
2. Test special positions (checkmate puzzles)
3. Test edge cases (stalemate, promotion)
4. Test AI at different depths
5. Test save/load across sessions
6. Test on mobile devices
7. Verify no memory leaks

Create a simple test harness to verify core functionality.
Document any known limitations.
```

## Implementation Status

### Completed Phases (✅)
- **Phase 1**: Foundation with MVC architecture established
- **Phase 2**: Complete game logic with comprehensive testing (86 unit tests)
- **Phase 3**: Full user interaction with enhanced visual feedback

### Current State
- Fully playable human vs human microchess game
- Complete visual feedback system (selected pieces, valid moves, last move, check warnings)
- Game status tracking and control buttons
- Comprehensive test suite (86 unit tests + 13 e2e tests)
- Clean MVC architecture with dependency injection

### Next Steps
- Phase 4: AI Implementation (Steps 10-12)
- Phase 5: Final polish features

## Key Learnings

### Architecture Improvements
1. **MVC with Dependency Injection** proved superior to original procedural design
2. **Constructor injection** makes components highly testable
3. **Strict separation** prevents tightly coupled code
4. **View abstraction** enables easy testing without DOM

### Testing Strategy
1. **Unit tests** for all business logic (moves, game state, pieces)
2. **Integration tests** for dependency injection
3. **End-to-end tests** for user interactions
4. **TDD approach** caught edge cases early

### Visual Feedback Enhancements
1. **Multiple highlight types** (selected, valid moves, last move, check)
2. **CSS animations** improve user experience
3. **Layered feedback** shows multiple states simultaneously
4. **Consistent color coding** (orange=selected, green=valid, yellow=last, red=check)

## Notes

- Each prompt builds on previous work
- No orphaned code - everything connects
- Incremental complexity increase
- Comprehensive testing at each step
- Early user interaction (Step 7) to enable manual testing
- AI comes after core game works
- Polish and persistence at the end
- **MVC architecture** enables independent testing of each layer
- **Dependency injection** makes the codebase highly maintainable
