import { test, expect, Page } from '@playwright/test';

test.describe('Project Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login si nécessaire
    const loginButton = page.locator('[data-testid="login-button"]');
    if (await loginButton.isVisible()) {
      await page.fill('[data-testid="email"]', 'test@ssii.com');
      await page.fill('[data-testid="password"]', 'test123');
      await loginButton.click();
      await page.waitForURL('/dashboard');
    }
  });

  test('should create a new project from brief', async ({ page }) => {
    // Navigate to new project
    await page.click('[data-testid="new-project-btn"]');
    await expect(page).toHaveURL(/.*\/projects\/new/);

    // Step 1: Enter brief
    await page.fill('[data-testid="project-brief"]',
      'Créer une application e-commerce avec paiement Stripe et gestion de stock');
    await page.click('[data-testid="next-step"]');

    // Step 2: Configuration
    await page.selectOption('[data-testid="stack-select"]', 'NEXTJS');
    await page.fill('[data-testid="budget-input"]', '50');
    await page.click('[data-testid="next-step"]');

    // Step 3: Requirements
    await page.check('[data-testid="security-owasp"]');
    await page.check('[data-testid="performance-lighthouse"]');
    await page.click('[data-testid="next-step"]');

    // Step 4: Review and launch
    await expect(page.locator('[data-testid="project-summary"]')).toBeVisible();
    await page.click('[data-testid="launch-project"]');

    // Wait for workflow to start
    await expect(page.locator('[data-testid="workflow-status"]'))
      .toContainText(/Running|En cours/, { timeout: 10000 });

    // Check agents are executing
    await expect(page.locator('[data-testid="agent-director-status"]'))
      .toContainText(/Running|En cours/, { timeout: 15000 });
  });

  test('should handle validation checkpoints', async ({ page }) => {
    // Create project
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-brief"]', 'Test project for validation');
    await page.click('[data-testid="quick-launch"]');

    // Wait for first checkpoint
    await page.waitForSelector('[data-testid="validation-modal"]', { timeout: 30000 });

    // Review architecture
    await expect(page.locator('[data-testid="architecture-review"]'))
      .toBeVisible();

    // Should display generated architecture
    await expect(page.locator('[data-testid="architecture-diagram"]'))
      .toBeVisible();

    // Approve
    await page.click('[data-testid="approve-architecture"]');

    // Check workflow continues
    await expect(page.locator('[data-testid="agent-developer-status"]'))
      .toContainText(/Running|En cours/, { timeout: 30000 });
  });

  test('should display real-time logs via WebSocket', async ({ page }) => {
    // Start a project
    await createQuickProject(page);

    // Wait for logs to appear
    await page.waitForSelector('[data-testid="agent-logs"]', { timeout: 10000 });

    // Check that logs are updating
    const initialLogs = await page.locator('[data-testid="log-entry"]').count();

    // Wait a bit for more logs
    await page.waitForTimeout(3000);

    const updatedLogs = await page.locator('[data-testid="log-entry"]').count();

    // Should have received more logs
    expect(updatedLogs).toBeGreaterThan(initialLogs);
  });

  test('should allow project cancellation', async ({ page }) => {
    await createQuickProject(page);

    // Wait for workflow to be running
    await expect(page.locator('[data-testid="workflow-status"]'))
      .toContainText(/Running|En cours/, { timeout: 10000 });

    // Cancel project
    await page.click('[data-testid="cancel-project"]');

    // Confirm cancellation
    await page.click('[data-testid="confirm-cancel"]');

    // Should show cancelled status
    await expect(page.locator('[data-testid="workflow-status"]'))
      .toContainText(/Cancelled|Annulé/, { timeout: 5000 });
  });

  test('should save project draft', async ({ page }) => {
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-brief"]', 'Test draft project');
    await page.fill('[data-testid="project-name"]', 'My Draft');

    // Save as draft
    await page.click('[data-testid="save-draft"]');

    // Should redirect to drafts
    await expect(page).toHaveURL(/.*\/drafts/);

    // Should see the draft
    await expect(page.locator('[data-testid="draft-item"]').filter({ hasText: 'My Draft' }))
      .toBeVisible();
  });
});

test.describe('Agent Workflow', () => {
  test('should execute all 6 agents in sequence', async ({ page }) => {
    await createQuickProject(page);

    const agents = [
      { name: 'director', timeout: 60000 },
      { name: 'architect', timeout: 90000 },
      { name: 'developer', timeout: 180000 },
      { name: 'security', timeout: 60000 },
      { name: 'qa', timeout: 60000 },
      { name: 'devops', timeout: 90000 }
    ];

    for (const agent of agents) {
      // Wait for agent to start
      await expect(page.locator(`[data-testid="agent-${agent.name}-status"]`))
        .toContainText(/Running|Success|En cours|Succès/, { timeout: agent.timeout });

      // Check agent card is visible
      await expect(page.locator(`[data-testid="agent-${agent.name}-card"]`))
        .toBeVisible();
    }

    // Final deployment URL should be available
    await expect(page.locator('[data-testid="deployment-url"]'))
      .toHaveAttribute('href', /https:\/\/.+/, { timeout: 30000 });
  });

  test('should display progress for each agent', async ({ page }) => {
    await createQuickProject(page);

    // Check director progress
    const directorProgress = page.locator('[data-testid="agent-director-progress"]');
    await expect(directorProgress).toBeVisible({ timeout: 10000 });

    // Progress should be between 0 and 100
    const progressText = await directorProgress.textContent();
    const progress = parseInt(progressText || '0');
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  test('should handle agent failures gracefully', async ({ page }) => {
    // Create a project that might fail (empty brief)
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-brief"]', '');
    await page.click('[data-testid="quick-launch"]');

    // Should show validation error
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText(/brief|required|nécessaire/i, { timeout: 5000 });
  });
});

test.describe('Project Dashboard', () => {
  test('should display project list', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show projects section
    await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
  });

  test('should filter projects by status', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on filter
    await page.click('[data-testid="filter-status"]');
    await page.click('[data-testid="filter-running"]');

    // Should only show running projects
    const projects = page.locator('[data-testid="project-card"]');
    const count = await projects.count();

    for (let i = 0; i < count; i++) {
      await expect(projects.nth(i).locator('[data-testid="project-status"]'))
        .toContainText(/Running|En cours/);
    }
  });

  test('should search projects by name', async ({ page }) => {
    await page.goto('/dashboard');

    // Enter search query
    await page.fill('[data-testid="search-projects"]', 'e-commerce');

    // Should filter results
    await expect(page.locator('[data-testid="project-card"]').first())
      .toContainText(/e-commerce/i);
  });
});

// Helper functions
async function createQuickProject(page: Page) {
  await page.goto('/dashboard');
  await page.click('[data-testid="quick-start"]');
  await page.fill('[data-testid="quick-brief"]', 'Test e-commerce platform');
  await page.click('[data-testid="generate-now"]');

  // Wait for project to be created
  await expect(page.locator('[data-testid="workflow-status"]'))
    .toBeVisible({ timeout: 10000 });
}
