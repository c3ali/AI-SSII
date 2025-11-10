import { test, expect } from '@playwright/test';

test.describe('Deployment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const loginButton = page.locator('[data-testid="login-button"]');
    if (await loginButton.isVisible()) {
      await page.fill('[data-testid="email"]', 'test@ssii.com');
      await page.fill('[data-testid="password"]', 'test123');
      await loginButton.click();
    }
  });

  test('should deploy to Vercel successfully', async ({ page }) => {
    // Create and complete a project
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-brief"]', 'Simple portfolio website');
    await page.click('[data-testid="quick-launch"]');

    // Wait for DevOps agent to complete
    await expect(page.locator('[data-testid="agent-devops-status"]'))
      .toContainText(/Success|Succès/, { timeout: 300000 }); // 5 minutes

    // Should show Vercel deployment
    await expect(page.locator('[data-testid="deployment-platform"]'))
      .toContainText(/Vercel/);

    // Should have deployment URL
    const deployUrl = await page.locator('[data-testid="deployment-url"]').getAttribute('href');
    expect(deployUrl).toMatch(/https:\/\/.+\.vercel\.app/);

    // Should show deployment logs
    await page.click('[data-testid="show-deployment-logs"]');
    await expect(page.locator('[data-testid="deployment-logs"]')).toBeVisible();
  });

  test('should setup database on Supabase', async ({ page }) => {
    await createProject(page, 'E-commerce with database');

    // Wait for deployment to complete
    await expect(page.locator('[data-testid="agent-devops-status"]'))
      .toContainText(/Success|Succès/, { timeout: 300000 });

    // Click on infrastructure details
    await page.click('[data-testid="infrastructure-details"]');

    // Should show Supabase database
    await expect(page.locator('[data-testid="database-provider"]'))
      .toContainText(/Supabase/);

    // Should have database URL
    await expect(page.locator('[data-testid="database-url"]')).toBeVisible();

    // Should show tables created
    await expect(page.locator('[data-testid="database-tables"]')).toBeVisible();
  });

  test('should configure environment variables', async ({ page }) => {
    await createProject(page, 'App with API keys');

    await expect(page.locator('[data-testid="agent-devops-status"]'))
      .toContainText(/Success|Succès/, { timeout: 300000 });

    // Check environment variables
    await page.click('[data-testid="show-env-vars"]');

    // Should list required env vars
    await expect(page.locator('[data-testid="env-var-item"]')).toHaveCount(await page.locator('[data-testid="env-var-item"]').count());

    // Should show which vars are configured
    await expect(page.locator('[data-testid="env-var-configured"]').first()).toBeVisible();
  });

  test('should run post-deployment checks', async ({ page }) => {
    await createProject(page, 'Full-stack application');

    await expect(page.locator('[data-testid="agent-devops-status"]'))
      .toContainText(/Success|Succès/, { timeout: 300000 });

    // Should show health checks
    await page.click('[data-testid="health-checks"]');

    // Should show successful health check
    await expect(page.locator('[data-testid="health-check-status"]'))
      .toContainText(/Healthy|OK/, { timeout: 30000 });

    // Should show response time
    await expect(page.locator('[data-testid="response-time"]')).toBeVisible();
  });

  test('should provide deployment rollback option', async ({ page }) => {
    await createProject(page, 'Test rollback');

    await expect(page.locator('[data-testid="agent-devops-status"]'))
      .toContainText(/Success|Succès/, { timeout: 300000 });

    // Should show rollback button
    await expect(page.locator('[data-testid="rollback-deployment"]')).toBeVisible();

    // Click rollback
    await page.click('[data-testid="rollback-deployment"]');

    // Should ask for confirmation
    await expect(page.locator('[data-testid="rollback-confirm-modal"]')).toBeVisible();
  });

  test('should display deployment metrics', async ({ page }) => {
    await createProject(page, 'Metrics test');

    await expect(page.locator('[data-testid="agent-devops-status"]'))
      .toContainText(/Success|Succès/, { timeout: 300000 });

    // Click on metrics
    await page.click('[data-testid="deployment-metrics"]');

    // Should show build time
    await expect(page.locator('[data-testid="build-time"]')).toBeVisible();

    // Should show deployment time
    await expect(page.locator('[data-testid="deployment-time"]')).toBeVisible();

    // Should show bundle size
    await expect(page.locator('[data-testid="bundle-size"]')).toBeVisible();
  });
});

test.describe('Infrastructure Cost Tracking', () => {
  test('should display estimated monthly cost', async ({ page }) => {
    await createProject(page, 'Cost tracking test');

    await expect(page.locator('[data-testid="agent-devops-status"]'))
      .toContainText(/Success|Succès/, { timeout: 300000 });

    // Check cost estimation
    await page.click('[data-testid="cost-estimation"]');

    const costText = await page.locator('[data-testid="monthly-cost"]').textContent();
    const cost = parseFloat(costText?.replace(/[^0-9.]/g, '') || '0');

    // Should be under 50€/month
    expect(cost).toBeLessThanOrEqual(50);
  });

  test('should breakdown costs by service', async ({ page }) => {
    await createProject(page, 'Cost breakdown test');

    await expect(page.locator('[data-testid="agent-devops-status"]'))
      .toContainText(/Success|Succès/, { timeout: 300000 });

    await page.click('[data-testid="cost-breakdown"]');

    // Should show Vercel cost
    await expect(page.locator('[data-testid="vercel-cost"]')).toBeVisible();

    // Should show Database cost
    await expect(page.locator('[data-testid="database-cost"]')).toBeVisible();

    // Should show OpenAI cost
    await expect(page.locator('[data-testid="openai-cost"]')).toBeVisible();
  });
});

// Helper function
async function createProject(page: any, brief: string) {
  await page.click('[data-testid="new-project-btn"]');
  await page.fill('[data-testid="project-brief"]', brief);
  await page.click('[data-testid="quick-launch"]');
}
