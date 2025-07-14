# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a microchess implementation project - a web-based chess variant played on a 4x5 board (4 files, 5 ranks) with simplified rules and no queen in the initial setup. The project uses vanilla JavaScript with ES6+ modules and follows an MVC architecture pattern.

## Architecture

### Mandatory Architectural Principles
- **ALWAYS use Model-View-Controller (MVC) architecture** - No exceptions
- **ALWAYS use constructor dependency injection** - Components must receive dependencies through constructors, never create their own
- **NEVER allow components to create their own dependencies** - Use dependency injection containers/factories
- **MAINTAIN strict separation of concerns** - Model handles business logic, View handles DOM/rendering, Controller coordinates between them

### Technology Stack
- Pure HTML/CSS/JavaScript (vanilla JS, no frameworks)
- ES6+ modules for code organization
- Model-View-Controller (MVC) architecture with dependency injection

### Current File Structure (MVC with Dependency Injection)
```
index.html
style.css
js/
  ├── game.js          (DI Container - creates and injects all dependencies)
  ├── controller.js    (Controller - coordinates model and view via DI)
  ├── view.js          (View - DOM manipulation, receives DOM elements via DI)
  ├── gameState.js     (Model - game state, rules, move validation)
  ├── moves.js         (Model - move validation engine)
  ├── pieces.js        (Model - piece definitions and symbols)
  └── storage.js       (Model - LocalStorage handling)
```

### Dependency Injection Pattern
```
Game (DI Container)
├── Creates: DOM elements, GameState, View
├── Injects: GameState + View → Controller
└── Controller (Pure)
    ├── Receives: GameState, View (no creation)
    ├── Coordinates: User events ↔ Model/View
    └── Resets: gameState.reset() (no new instances)
```

## Key Implementation Details

### Game Rules (Microchess per Glimne 1997)
- 4x5 board (files a-d, ranks 1-5)
- Starting position: Rook-Knight-Bishop-King on back rank, one pawn per side
- No queen in initial setup
- No castling, no en passant (pawns can't double-move)
- Pawn promotion available to Queen/Rook/Bishop/Knight
- Standard chess rules otherwise apply

### AI Implementation
- Minimax algorithm with alpha-beta pruning
- Default search depth: 3-4 levels
- Evaluation function considering material, mobility, positioning
- Hint system using reduced depth (2 levels)
- 0.5-1.5 second delay for realistic gameplay

### User Interface
- 4x5 visual board with alternating colors (#f0d9b5 light, #b58863 dark)
- Unicode chess piece symbols (♔♕♖♗♘♙ for white, ♚♛♜♝♞♟ for black)
- Click-based piece selection and movement
- Visual feedback: selected piece highlighting, valid move indicators, last move highlighting
- Game controls: New Game, Resign, Hint buttons
- Turn indicator and game status display

### Data Persistence
- LocalStorage for game state persistence
- Color alternation between games (human switches between white/black)
- Save/load functionality for incomplete games

## Development Commands

The project uses a Makefile with shoreman process management for development:

- **Development server**: `make dev` - Starts HTTP server with file logging via shoreman
- **Testing**: `make test` - Runs Jest test suite 
- **View logs**: `make tail-log` - Shows recent development logs from dev.log file
- **Manual testing**: Open http://localhost:8000 in browser after running `make dev`
- **Debugging**: Use browser DevTools

### Process Management
- Uses shoreman (Procfile-based process manager) for `python3 -m http.server 8000`
- All output is logged to `dev.log` with timestamps and process identification
- Advantage: Persistent logging for debugging server issues and tracking requests
- Server accessible at http://localhost:8000

## Implementation Approach

The project follows a 15-step implementation plan divided into 5 phases:

1. **Foundation** (Steps 1-3): HTML structure, board rendering, piece placement
2. **Game Logic** (Steps 4-6): Move validation, game state, turn management
3. **User Interaction** (Steps 7-9): Click handling, visual feedback, UI controls
4. **AI Implementation** (Steps 10-12): Evaluation function, minimax, AI integration
5. **Polish** (Steps 13-15): Persistence, promotion dialog, final testing

Each step should be implemented incrementally with testing before proceeding to the next.

## Code Style Requirements

### MVC and Dependency Injection (MANDATORY)
- **ALL components MUST use constructor dependency injection** - No exceptions
- **View components MUST receive DOM elements through constructor** - Never use document.getElementById inside components
- **Controller components MUST receive model and view through constructor** - No component creation allowed
- **Model components MUST be pure** - No DOM access, no component creation
- **Only the DI container (Game class) may create dependencies** - All other components are consumers only

### General Requirements
- Use ES6+ modules with clear imports/exports
- Maintain strict MVC separation of concerns
- Include comprehensive error handling and dependency validation
- Use descriptive variable and function names
- Add unit tests for core game logic (move validation, AI evaluation)
- Follow the existing code style if any modules are already implemented
- **Always use named constants instead of magic strings or magic numbers**

## Testing Strategy

### Unit Testing (with Dependency Injection)
- Unit tests for move validation engine
- Position-specific tests for checkmate/stalemate detection
- AI behavior verification with known positions
- **Dependency injection testing** - Verify components can be created with mock dependencies
- **Isolation testing** - Test each MVC component independently
- **Constructor validation testing** - Ensure proper dependency validation

### Integration Testing
- Cross-browser compatibility testing
- Mobile device responsive testing
- Performance benchmarking for AI search depth
- **End-to-end testing with Playwright** - Browser automation for user interaction testing

## Key Files to Review

- `spec.md`: Complete technical specification with all requirements
- `plan.md`: Detailed 15-step implementation plan with specific prompts

## Session Learnings

### MVC Refactoring with Dependency Injection (2025-07-13)
- **Successfully refactored monolithic Game class into proper MVC architecture**
- **Implemented pure constructor dependency injection pattern** - No components create their own dependencies
- **Created View class** - Handles all DOM manipulation, receives DOM elements via constructor
- **Created Controller class** - Coordinates model/view interactions, receives dependencies via constructor  
- **Refactored Game class** - Now acts as dependency injection container, creates and injects all dependencies
- **Added GameState.reset() method** - Avoids creating new instances for new games
- **Added comprehensive testing** - Unit tests validate dependency injection, isolation testing with mocks
- **Key insight**: Constructor dependency injection makes components highly testable and eliminates hidden coupling
- **Added Playwright for end-to-end testing** - Browser automation to test actual user interactions
- **Architectural principle established**: ALWAYS use MVC + dependency injection, NO exceptions

## Development Server Notes
- No need to ever restart the http server; reloading the page is enough

## Error Handling Improvements (2025-07-14)
- **Enhanced getPieceAt/getValidMovesForPiece error handling** - Added comprehensive parameter validation
- **Consolidated validation logic** - Created validatePosition() helper method for DRY principle
- **Added robust error messages** - Clear error messages for type validation, NaN detection, and bounds checking
- **Controller error handling** - Added try-catch blocks in controller to handle validation errors gracefully
- **Comprehensive test coverage** - Added 17 new unit tests covering all error scenarios
- **Key improvement**: Methods now throw descriptive errors instead of silently returning null/empty arrays for invalid input

## Controller Architecture Refactoring (2025-07-14)
- **Eliminated code duplication** - Created updatePieceSelection() method to consolidate repeated selection logic
- **Improved View separation** - Added view.updateDisplay() method to batch all view updates atomically
- **Reduced controller-view coupling** - Controller now passes consolidated state instead of making multiple view calls
- **Enhanced performance** - Eliminated redundant clearHighlights() followed by re-highlighting patterns
- **Better MVC adherence** - Controller coordinates but doesn't micromanage view's internal operations
- **Key improvement**: Single atomic display update instead of multiple DOM manipulations