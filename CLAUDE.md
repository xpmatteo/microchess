# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a microchess implementation project - a web-based chess variant played on a 4x5 board (4 files, 5 ranks) with simplified rules and no queen in the initial setup. The project uses vanilla JavaScript with ES6+ modules and follows an MVC architecture pattern.

## Architecture

### Technology Stack
- Pure HTML/CSS/JavaScript (vanilla JS, no frameworks)
- ES6+ modules for code organization
- Model-View-Controller (MVC) architecture

### Planned File Structure
```
index.html
style.css
js/
  ├── game.js          (Game model - game state, rules, move validation)
  ├── ai.js            (AI logic - minimax algorithm, evaluation)
  ├── ui.js            (View - DOM manipulation, user interaction)
  ├── controller.js    (Controller - coordinates model and view)
  ├── moves.js         (Move validation engine)
  ├── gameState.js     (Game state management)
  ├── pieces.js        (Piece definitions and symbols)
  └── storage.js       (LocalStorage handling)
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

Since this is a vanilla JavaScript project with no build system:

- **Development**: Open `index.html` in a modern browser
- **Testing**: Manual testing through browser console and gameplay
- **Debugging**: Use browser DevTools

## Implementation Approach

The project follows a 15-step implementation plan divided into 5 phases:

1. **Foundation** (Steps 1-3): HTML structure, board rendering, piece placement
2. **Game Logic** (Steps 4-6): Move validation, game state, turn management
3. **User Interaction** (Steps 7-9): Click handling, visual feedback, UI controls
4. **AI Implementation** (Steps 10-12): Evaluation function, minimax, AI integration
5. **Polish** (Steps 13-15): Persistence, promotion dialog, final testing

Each step should be implemented incrementally with testing before proceeding to the next.

## Code Style Requirements

- Use ES6+ modules with clear imports/exports
- Maintain MVC separation of concerns
- Include comprehensive error handling
- Use descriptive variable and function names
- Add unit tests for core game logic (move validation, AI evaluation)
- Follow the existing code style if any modules are already implemented

## Testing Strategy

- Unit tests for move validation engine
- Position-specific tests for checkmate/stalemate detection
- AI behavior verification with known positions
- Cross-browser compatibility testing
- Mobile device responsive testing
- Performance benchmarking for AI search depth

## Key Files to Review

- `spec.md`: Complete technical specification with all requirements
- `plan.md`: Detailed 15-step implementation plan with specific prompts
- `todo.md`: Current project status and task checklist