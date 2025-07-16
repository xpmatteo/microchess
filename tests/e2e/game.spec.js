// ABOUTME: Playwright end-to-end tests for microchess game interactions
// ABOUTME: Tests game initialization, piece movement, controls, and visual feedback

import { test, expect } from '@playwright/test';

test.describe('Microchess Game', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console messages
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warn' || type === 'log') {
        console.log(`[Browser ${type.toUpperCase()}] ${msg.text()}`);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.log(`[Browser ERROR] ${error.message}`);
    });

    // Capture request failures
    page.on('requestfailed', request => {
      console.log(`[Request FAILED] ${request.url()} - ${request.failure()?.errorText}`);
    });

    await page.goto('/');
  });

  test('should load and initialize the game', async ({ page }) => {
    // Wait a moment for JS to execute
    await page.waitForTimeout(1000);
    
    // Check that the page loads
    await expect(page).toHaveTitle('Microchess Game');
    
    // Check that game container is present
    await expect(page.locator('#game-container')).toBeVisible();
    
    // Check that the board renders with correct number of squares
    await expect(page.locator('.square')).toHaveCount(20); // 4x5 board
    
    // Check that pieces are rendered
    const pieces = page.locator('.square span[data-piece]');
    await expect(pieces).toHaveCount(10); // 5 white + 5 black pieces
    
    // Check initial game status
    await expect(page.locator('#game-status')).toContainText('White to move');
  });

  test('should debug click interaction', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Log the current state before clicking
    const d2Square = page.locator('[data-file="3"][data-rank="1"]');
    console.log('About to click d2 square...');
    
    // Check if click handler is attached
    const hasClickHandler = await d2Square.evaluate(el => {
      return typeof el.onclick === 'function' || el.listeners?.('click')?.length > 0;
    });
    console.log('Click handler attached:', hasClickHandler);
    
    // Click the square
    await d2Square.click();
    
    // Wait a bit for any async operations
    await page.waitForTimeout(500);
    
    // Check the classes after clicking
    const classes = await d2Square.getAttribute('class');
    console.log('Classes after click:', classes);
    
    // Check if any valid move squares appeared
    const validMoves = await page.locator('.square.valid-move').count();
    console.log('Valid move squares found:', validMoves);
  });

  test('should render board with correct labels', async ({ page }) => {
    // Check file labels (a-d)
    const fileLabels = page.locator('.file-label');
    await expect(fileLabels).toHaveCount(4);
    await expect(fileLabels.nth(0)).toContainText('a');
    await expect(fileLabels.nth(1)).toContainText('b');
    await expect(fileLabels.nth(2)).toContainText('c');
    await expect(fileLabels.nth(3)).toContainText('d');
    
    // Check rank labels (1-5)
    const rankLabels = page.locator('.rank-label');
    await expect(rankLabels).toHaveCount(5);
    await expect(rankLabels.nth(0)).toContainText('5');
    await expect(rankLabels.nth(4)).toContainText('1');
  });

  test('should render initial piece positions correctly', async ({ page }) => {
    // Check white king on d1
    const d1Square = page.locator('[data-file="3"][data-rank="0"]');
    const whiteKing = d1Square.locator('span[data-piece="K"][data-color="white"]');
    await expect(whiteKing).toBeVisible();
    await expect(whiteKing).toContainText('♔');
    
    // Check black king on a5
    const a5Square = page.locator('[data-file="0"][data-rank="4"]');
    const blackKing = a5Square.locator('span[data-piece="K"][data-color="black"]');
    await expect(blackKing).toBeVisible();
    await expect(blackKing).toContainText('♚');
    
    // Check white pawn on d2
    const d2Square = page.locator('[data-file="3"][data-rank="1"]');
    const whitePawn = d2Square.locator('span[data-piece="P"][data-color="white"]');
    await expect(whitePawn).toBeVisible();
    await expect(whitePawn).toContainText('♙');
  });

  test('should show valid moves when clicking a piece', async ({ page }) => {
    // Click on white pawn at d2
    const d2Square = page.locator('[data-file="3"][data-rank="1"]');
    await d2Square.click();
    
    // Check that the square is highlighted as selected
    await expect(d2Square).toHaveClass(/selected/);
    
    // Check that valid move squares are highlighted
    const validMoveSquares = page.locator('.square.valid-move');
    await expect(validMoveSquares).toHaveCount(1); // Pawn should have 1 valid move forward
  });

  test('should allow moving a piece', async ({ page }) => {
    // Click on white pawn at d2
    const d2Square = page.locator('[data-file="3"][data-rank="1"]');
    await d2Square.click();
    
    // Click on d3 to move the pawn
    const d3Square = page.locator('[data-file="3"][data-rank="2"]');
    await d3Square.click();
    
    // Check that the pawn moved from d2 to d3
    await expect(d2Square.locator('span[data-piece]')).toHaveCount(0);
    await expect(d3Square.locator('span[data-piece="P"][data-color="white"]')).toBeVisible();
    
    // Check that turn changed
    await expect(page.locator('#game-status')).toContainText('Black to move');
    
    // Check that highlights are cleared
    await expect(page.locator('.square.selected')).toHaveCount(0);
    await expect(page.locator('.square.valid-move')).toHaveCount(0);
  });

  test('should deselect piece when clicking same square twice', async ({ page }) => {
    // Click on white pawn at d2
    const d2Square = page.locator('[data-file="3"][data-rank="1"]');
    await d2Square.click();
    
    // Verify it's selected
    await expect(d2Square).toHaveClass(/selected/);
    
    // Click the same square again
    await d2Square.click();
    
    // Verify it's deselected
    await expect(d2Square).not.toHaveClass(/selected/);
    await expect(page.locator('.square.valid-move')).toHaveCount(0);
  });

  test('should only allow moving pieces of current player', async ({ page }) => {
    // Try to click on black king (a5) when it's white's turn
    const a5Square = page.locator('[data-file="0"][data-rank="4"]');
    await a5Square.click();
    
    // Should not be selected since it's not white's turn
    await expect(a5Square).not.toHaveClass(/selected/);
    await expect(page.locator('.square.valid-move')).toHaveCount(0);
  });

  test('should handle game controls', async ({ page }) => {
    // Check that controls are visible
    await expect(page.locator('#new-game-btn')).toBeVisible();
    await expect(page.locator('#resign-btn')).toBeVisible();
    await expect(page.locator('#hint-btn')).toBeVisible();
    
    // Check initial button states
    await expect(page.locator('#new-game-btn')).toBeEnabled();
    await expect(page.locator('#resign-btn')).toBeEnabled();
    await expect(page.locator('#hint-btn')).toBeEnabled();
  });

  test('should start new game when clicking new game button', async ({ page }) => {
    // Make a move first
    await page.locator('[data-file="3"][data-rank="1"]').click(); // d2 pawn
    await page.locator('[data-file="3"][data-rank="2"]').click(); // d3
    
    // Verify turn changed
    await expect(page.locator('#game-status')).toContainText('Black to move');
    
    // Click new game
    await page.locator('#new-game-btn').click();
    
    // Verify game reset
    await expect(page.locator('#game-status')).toContainText('White to move');
    
    // Verify pawn is back at d2
    const d2Square = page.locator('[data-file="3"][data-rank="1"]');
    await expect(d2Square.locator('span[data-piece="P"][data-color="white"]')).toBeVisible();
    
    const d3Square = page.locator('[data-file="3"][data-rank="2"]');
    await expect(d3Square.locator('span[data-piece]')).toHaveCount(0);
  });

  test('should handle resignation', async ({ page }) => {
    // Click resign button
    await page.locator('#resign-btn').click();
    
    // Check that game status shows resignation
    await expect(page.locator('#game-status')).toContainText('Game resigned');
    
    // Check that resign and hint buttons are disabled
    await expect(page.locator('#resign-btn')).toBeDisabled();
    await expect(page.locator('#hint-btn')).toBeDisabled();
  });

  test('should handle hint button', async ({ page }) => {
    // Click hint button
    await page.locator('#hint-btn').click();
    
    // Check that hint message appears (AI hint is now implemented)
    await expect(page.locator('#game-status')).toContainText('Hint: Consider the highlighted move');
  });

  test('should apply correct CSS classes to squares', async ({ page }) => {
    // Check that squares have light/dark classes
    const squares = page.locator('.square');
    const squareCount = await squares.count();
    
    for (let i = 0; i < squareCount; i++) {
      const square = squares.nth(i);
      const hasLight = await square.evaluate(el => el.classList.contains('light'));
      const hasDark = await square.evaluate(el => el.classList.contains('dark'));
      
      // Each square should have exactly one of light or dark
      expect(hasLight || hasDark).toBe(true);
      expect(hasLight && hasDark).toBe(false);
    }
  });
});