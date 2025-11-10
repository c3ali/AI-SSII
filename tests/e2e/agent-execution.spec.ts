import { test, expect } from '@playwright/test';

test.describe('Agent Execution Details', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login
    const loginButton = page.locator('[data-testid="login-button"]');
    if (await loginButton.isVisible()) {
      await page.fill('[data-testid="email"]', 'test@ssii.com');
      await page.fill('[data-testid="password"]', 'test123');
      await loginButton.click();
    }
  });

  test('Director Agent should generate project plan', async ({ page }) => {
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-brief"]',
      'Application de gestion de tâches collaborative avec notifications temps réel');
    await page.click('[data-testid="quick-launch"]');

    // Wait for Director to complete
    await expect(page.locator('[data-testid="agent-director-status"]'))
      .toContainText(/Success|Succès/, { timeout: 60000 });

    // Check output exists
    await page.click('[data-testid="agent-director-card"]');

    // Should display user stories
    await expect(page.locator('[data-testid="user-stories-list"]')).toBeVisible();

    // Should display timeline
    await expect(page.locator('[data-testid="project-timeline"]')).toBeVisible();

    // Should display budget estimation
    await expect(page.locator('[data-testid="budget-estimation"]')).toBeVisible();
  });

  test('Architect Agent should generate technical architecture', async ({ page }) => {
    await createAndWaitForAgent(page, 'architect');

    // Click on architect card
    await page.click('[data-testid="agent-architect-card"]');

    // Should display architecture diagram
    await expect(page.locator('[data-testid="architecture-diagram"]')).toBeVisible();

    // Should display stack selection
    await expect(page.locator('[data-testid="tech-stack"]')).toBeVisible();

    // Should display database schema
    await expect(page.locator('[data-testid="database-schema"]')).toBeVisible();
  });

  test('Developer Agent should generate code', async ({ page }) => {
    await createAndWaitForAgent(page, 'developer');

    // Click on developer card
    await page.click('[data-testid="agent-developer-card"]');

    // Should display file tree
    await expect(page.locator('[data-testid="file-tree"]')).toBeVisible();

    // Should have generated files
    const fileCount = await page.locator('[data-testid="generated-file"]').count();
    expect(fileCount).toBeGreaterThan(0);

    // Should show code preview
    await page.click('[data-testid="generated-file"]').first();
    await expect(page.locator('[data-testid="code-preview"]')).toBeVisible();
  });

  test('Security Agent should run security checks', async ({ page }) => {
    await createAndWaitForAgent(page, 'security');

    // Click on security card
    await page.click('[data-testid="agent-security-card"]');

    // Should display OWASP score
    await expect(page.locator('[data-testid="owasp-score"]')).toBeVisible();

    const scoreText = await page.locator('[data-testid="owasp-score"]').textContent();
    const score = parseFloat(scoreText || '0');
    expect(score).toBeGreaterThanOrEqual(9.0);

    // Should display vulnerabilities (if any)
    await expect(page.locator('[data-testid="security-issues"]')).toBeVisible();
  });

  test('QA Agent should run tests and quality checks', async ({ page }) => {
    await createAndWaitForAgent(page, 'qa');

    // Click on QA card
    await page.click('[data-testid="agent-qa-card"]');

    // Should display test results
    await expect(page.locator('[data-testid="test-results"]')).toBeVisible();

    // Should display coverage
    await expect(page.locator('[data-testid="test-coverage"]')).toBeVisible();

    const coverageText = await page.locator('[data-testid="test-coverage"]').textContent();
    const coverage = parseFloat(coverageText || '0');
    expect(coverage).toBeGreaterThanOrEqual(90);

    // Should display Lighthouse scores
    await expect(page.locator('[data-testid="lighthouse-scores"]')).toBeVisible();
  });

  test('DevOps Agent should deploy application', async ({ page }) => {
    await createAndWaitForAgent(page, 'devops');

    // Click on DevOps card
    await page.click('[data-testid="agent-devops-card"]');

    // Should display deployment status
    await expect(page.locator('[data-testid="deployment-status"]'))
      .toContainText(/Deployed|Déployé/);

    // Should display deployment URL
    const deployUrl = page.locator('[data-testid="deployment-url"]');
    await expect(deployUrl).toBeVisible();
    await expect(deployUrl).toHaveAttribute('href', /https:\/\/.+/);

    // Should display infrastructure details
    await expect(page.locator('[data-testid="infrastructure-details"]')).toBeVisible();
  });
});

test.describe('Agent Communication', () => {
  test('should show agent-to-agent data flow', async ({ page }) => {
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-brief"]', 'Simple landing page');
    await page.click('[data-testid="quick-launch"]');

    // Wait for multiple agents to run
    await expect(page.locator('[data-testid="agent-architect-status"]'))
      .toContainText(/Running|Success/, { timeout: 90000 });

    // Check data flow visualization
    await page.click('[data-testid="show-workflow-graph"]');
    await expect(page.locator('[data-testid="workflow-graph"]')).toBeVisible();

    // Should show connections between agents
    await expect(page.locator('[data-testid="agent-connection"]').first()).toBeVisible();
  });

  test('should allow manual intervention at checkpoints', async ({ page }) => {
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-brief"]', 'Test manual intervention');

    // Enable manual checkpoints
    await page.check('[data-testid="enable-manual-checkpoints"]');
    await page.click('[data-testid="quick-launch"]');

    // Wait for first checkpoint
    await page.waitForSelector('[data-testid="checkpoint-modal"]', { timeout: 60000 });

    // Should show options to approve or reject
    await expect(page.locator('[data-testid="approve-checkpoint"]')).toBeVisible();
    await expect(page.locator('[data-testid="reject-checkpoint"]')).toBeVisible();

    // Should show current agent output
    await expect(page.locator('[data-testid="checkpoint-output"]')).toBeVisible();
  });
});

// Helper function
async function createAndWaitForAgent(page: any, agentName: string) {
  await page.click('[data-testid="new-project-btn"]');
  await page.fill('[data-testid="project-brief"]', `Test project for ${agentName}`);
  await page.click('[data-testid="quick-launch"]');

  // Wait for the specific agent to complete
  await expect(page.locator(`[data-testid="agent-${agentName}-status"]`))
    .toContainText(/Success|Succès/, { timeout: 180000 });
}
