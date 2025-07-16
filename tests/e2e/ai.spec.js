// ABOUTME: End-to-end tests for AI integration and gameplay
// ABOUTME: Tests AI moves, delays, color switching, and overall gameplay flow

import { test, expect } from '@playwright/test';

test.describe('Microchess AI Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for game to initialize
    await expect(page.locator('#game-board')).toBeVisible();
    await expect(page.locator('#game-status')).toContainText('White to move');
  });

  test('should make AI move after human move', async ({ page }) => {
    // Human (white) makes a move
    await page.locator('[data-rank="1"][data-file="0"]').click(); // Select white pawn
    await page.locator('[data-rank="2"][data-file="0"]').click(); // Move pawn forward
    
    // Wait for AI (black) to make a move (with delay)
    await page.waitForTimeout(2000); // Wait for AI delay
    
    // Check that turn switched back to white
    await expect(page.locator('#game-status')).toContainText('White to move');
  });

  test('should provide AI hints when requested', async ({ page }) => {
    // Click hint button
    await page.locator('#hint-btn').click();
    
    // Wait for hint to be processed
    await page.waitForTimeout(100);
    
    // Check that hint is displayed
    await expect(page.locator('#game-status')).toContainText('Hint: Consider the highlighted move');
    
    // Check that a move is highlighted (should have valid-move class)
    const validMoveSquares = page.locator('.valid-move');
    await expect(validMoveSquares).toHaveCount(1);
  });

  test('should switch AI color on new game', async ({ page }) => {
    // Start a new game
    await page.locator('#new-game-btn').click();
    
    // Wait for game to reset
    await page.waitForTimeout(100);
    
    // AI should now be white and make the first move automatically
    await page.waitForTimeout(2000); // Wait for AI delay
    
    // Turn should be black (human) after AI move
    await expect(page.locator('#game-status')).toContainText('Black to move');
  });

  test('should handle AI vs AI simulation (multiple new games)', async ({ page }) => {
    // Test multiple new games to verify color switching
    for (let i = 0; i < 3; i++) {
      await page.locator('#new-game-btn').click();
      await page.waitForTimeout(100);
      
      // Check initial state
      if (i % 2 === 0) {
        // Even games: AI is white, should move first
        await page.waitForTimeout(2000);
        await expect(page.locator('#game-status')).toContainText('Black to move');
      } else {
        // Odd games: AI is black, human moves first
        await expect(page.locator('#game-status')).toContainText('White to move');
      }
    }
  });

  test('should handle resignation correctly', async ({ page }) => {
    // Resign the game
    await page.locator('#resign-btn').click();
    
    // Check game status
    await expect(page.locator('#game-status')).toContainText('Game resigned');
    
    // Controls should be disabled except new game
    await expect(page.locator('#resign-btn')).toBeDisabled();
    await expect(page.locator('#hint-btn')).toBeDisabled();
    await expect(page.locator('#new-game-btn')).toBeEnabled();
  });

  test('should maintain game state consistency during AI moves', async ({ page }) => {
    // Make a human move
    await page.locator('[data-rank="1"][data-file="0"]').click();
    await page.locator('[data-rank="2"][data-file="0"]').click();
    
    // Wait for AI move
    await page.waitForTimeout(2000);
    
    // Verify board state is consistent
    const board = await page.locator('#game-board');
    await expect(board).toBeVisible();
    
    // Should have pieces on the board (check for squares with piece content)
    const pieces = page.locator('.square').filter({ hasText: /[♔♕♖♗♘♙♚♛♜♝♞♟]/ });
    const pieceCount = await pieces.count();
    expect(pieceCount).toBeGreaterThan(6); // Should have at least some pieces
    
    // Status should show valid turn
    const status = await page.locator('#game-status').textContent();
    expect(status).toMatch(/(White|Black) to move/);
  });
});