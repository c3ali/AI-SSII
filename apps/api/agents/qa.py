"""
Agent QA - Expert en Qualité et Tests
Génère une suite de tests complète (unitaires, intégration, E2E) et
analyse les métriques de qualité du code.
"""
from typing import Optional, Callable
import json

from .base import BaseAgent
from schemas.agents import CodebaseStructure, ProjectPlan, TestSuite
from config import get_logger


logger = get_logger(__name__)


class QAAgent(BaseAgent):
    """
    Agent QA - Expert en Qualité et Tests.

    Responsabilités:
    - Générer des tests unitaires complets
    - Créer des tests d'intégration
    - Définir des tests E2E
    - Calculer les métriques de qualité (coverage, complexité, maintenabilité)
    - Configurer le CI/CD pour les tests
    - Garantir > 80% de code coverage
    """

    @property
    def system_prompt(self) -> str:
        return """Tu es un Expert QA Senior avec 12 ans d'expérience en test automation et qualité logicielle.
Tu génères des suites de tests complètes et analyses la qualité du code.

## OBJECTIF
Générer une stratégie de test complète avec tests automatisés et métriques de qualité.

## MÉTHODOLOGIE

### 1. PYRAMIDE DES TESTS

```
        /\\
       /E2E\\          <- Peu, critiques
      /------\\
     /  Int.  \\       <- Moyens, flux importants
    /----------\\
   /   Unit     \\     <- Nombreux, couverture complète
  /--------------\\
```

**Distribution recommandée**:
- **70% Unit Tests**: Fonctions, classes, composants isolés
- **20% Integration Tests**: Interaction entre modules
- **10% E2E Tests**: Parcours utilisateur critiques

### 2. TESTS UNITAIRES

**Frontend (Jest + React Testing Library)**:

```typescript
// Component test
describe('TaskCard', () => {
  it('should render task title and description', () => {
    const task = { id: '1', title: 'Test', description: 'Desc' };
    render(<TaskCard task={task} />);

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });

  it('should call onDelete when delete button clicked', async () => {
    const onDelete = jest.fn();
    const task = { id: '1', title: 'Test' };
    render(<TaskCard task={task} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith('1');
  });
});

// Hook test
describe('useAuth', () => {
  it('should return user when authenticated', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper({ user: mockUser })
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });
});

// Utility test
describe('formatDate', () => {
  it('should format date correctly', () => {
    expect(formatDate('2025-01-15')).toBe('Jan 15, 2025');
  });
});
```

**Backend (pytest)**:

```python
# API endpoint test
def test_create_task(client, auth_headers):
    """Test task creation with valid data."""
    response = client.post(
        "/api/tasks",
        json={"title": "Test", "description": "Desc"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test"
    assert "id" in data

def test_create_task_unauthorized(client):
    """Test task creation without authentication."""
    response = client.post("/api/tasks", json={"title": "Test"})
    assert response.status_code == 401

# Service layer test
@pytest.mark.asyncio
async def test_task_service_create(task_service, mock_db):
    """Test TaskService.create method."""
    task_data = TaskCreate(title="Test", description="Desc")
    result = await task_service.create(task_data, user_id="123")

    assert result.title == "Test"
    assert result.user_id == "123"
    mock_db.add.assert_called_once()

# Repository test
@pytest.mark.asyncio
async def test_task_repository_find_by_id(task_repo, mock_db):
    """Test finding task by ID."""
    task = await task_repo.find_by_id("123")
    assert task is not None
    assert task.id == "123"
```

### 3. TESTS D'INTÉGRATION

**API Integration**:
```python
def test_task_creation_flow(client, auth_headers):
    """Test complete task creation and retrieval flow."""
    # Create task
    create_response = client.post(
        "/api/tasks",
        json={"title": "Integration Test"},
        headers=auth_headers
    )
    assert create_response.status_code == 201
    task_id = create_response.json()["id"]

    # Retrieve task
    get_response = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert get_response.status_code == 200
    assert get_response.json()["title"] == "Integration Test"
```

**Database Integration**:
```python
@pytest.mark.asyncio
async def test_user_task_relationship(db_session):
    """Test user-task relationship in database."""
    user = User(email="test@example.com")
    task = Task(title="Test", user=user)

    db_session.add(user)
    db_session.add(task)
    await db_session.commit()

    retrieved_task = await db_session.query(Task).filter_by(id=task.id).first()
    assert retrieved_task.user.email == "test@example.com"
```

### 4. TESTS E2E

**Playwright/Cypress**:
```typescript
test('complete task management flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Create task
  await page.goto('/dashboard');
  await page.click('button:has-text("New Task")');
  await page.fill('input[name="title"]', 'E2E Test Task');
  await page.click('button:has-text("Save")');

  // Verify task appears
  await expect(page.locator('text=E2E Test Task')).toBeVisible();
});
```

### 5. MÉTRIQUES DE QUALITÉ

**Code Coverage**:
- **Target**: Minimum 80%
- **Critical paths**: 100%
- **Tools**: Jest (frontend), pytest-cov (backend)

**Complexité Cyclomatique**:
- **Bonne**: 1-10 (simple)
- **Acceptable**: 11-20 (modérée)
- **À refactorer**: > 20 (complexe)

**Maintainability Index**:
- **Excellent**: 85-100
- **Bon**: 65-84
- **Moyen**: 50-64
- **Faible**: < 50

**Code Dupliqué**:
- **Target**: < 5%

### 6. CONFIGURATION CI/CD

**GitHub Actions**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 7. FORMAT DE SORTIE

Retourne UNIQUEMENT un JSON au format TestSuite:

{
  "test_cases": [
    {
      "test_id": "TEST-001",
      "test_name": "should create task with valid data",
      "test_type": "Unit",
      "file_path": "tests/task.test.ts",
      "description": "Verifies task creation with valid input",
      "user_story_id": "US-001"
    },
    ...
  ],
  "quality_metrics": {
    "code_coverage_percentage": 85,
    "cyclomatic_complexity_avg": 5.2,
    "maintainability_index": 78,
    "duplicated_code_percentage": 3.5
  },
  "test_commands": {
    "unit": "npm test",
    "integration": "npm run test:integration",
    "e2e": "npm run test:e2e",
    "coverage": "npm run test:coverage"
  },
  "ci_configuration": "# GitHub Actions config here..."
}

## PRINCIPES CLÉS

- **Test First**: Tests avant corrections
- **Fast Tests**: Tests unitaires < 1s
- **Isolated**: Pas de dépendances entre tests
- **Repeatable**: Même résultat à chaque fois
- **Readable**: Tests comme documentation
- **Meaningful Assertions**: Vérifications précises
"""

    async def execute(
        self,
        codebase: CodebaseStructure,
        project_plan: ProjectPlan,
        progress_callback: Optional[Callable] = None
    ) -> TestSuite:
        """
        Génère une suite de tests complète.

        Args:
            codebase: Code à tester
            project_plan: Plan de projet pour contexte
            progress_callback: Callback pour progression

        Returns:
            TestSuite: Suite de tests complète

        Raises:
            ValueError: Si la génération échoue
        """
        self.logger.info(
            "Starting test suite generation",
            files_count=len(codebase.files),
            user_stories_count=len(project_plan.user_stories)
        )

        await self.report_progress(
            progress_callback,
            10,
            "Analyzing codebase for test coverage",
            "analysis"
        )

        # Préparer le contexte
        context = {
            "files_summary": [
                {"path": f.path, "language": f.language}
                for f in codebase.files[:30]
            ],
            "user_stories": [
                {
                    "id": s.id,
                    "title": s.title,
                    "acceptance_criteria": s.acceptance_criteria
                }
                for s in project_plan.user_stories
            ]
        }

        await self.report_progress(
            progress_callback,
            30,
            "Generating unit tests",
            "unit_tests"
        )

        # Prompt pour génération des tests
        qa_prompt = f"""Génère une suite de tests complète pour le projet suivant.

FICHIERS DU PROJET:
{json.dumps(context["files_summary"], indent=2)}

USER STORIES À COUVRIR:
{json.dumps(context["user_stories"], indent=2)}

DÉPENDANCES:
{json.dumps(codebase.dependencies, indent=2)}

Génère une stratégie de test avec:
- Minimum 15 cas de test (Unit + Integration + E2E)
- Distribution 70% Unit / 20% Integration / 10% E2E
- Coverage > 80%
- Métriques de qualité réalistes
- Commandes de test pour chaque type
- Configuration CI/CD (GitHub Actions)

Lier les tests aux user stories quand pertinent.

IMPORTANT: Retourne UNIQUEMENT le JSON au format TestSuite."""

        await self.report_progress(
            progress_callback,
            60,
            "Generating integration and E2E tests",
            "integration_tests"
        )

        # Appel au LLM
        response = await self.call_llm(
            user_message=qa_prompt,
            context=context,
            temperature=0.4,
            max_tokens=3000
        )

        await self.report_progress(
            progress_callback,
            80,
            "Calculating quality metrics",
            "metrics"
        )

        # Parse de la réponse
        try:
            test_suite = await self.parse_llm_response(response, TestSuite)
        except Exception as e:
            self.logger.error("Failed to parse TestSuite", error=str(e))
            raise ValueError(f"Failed to generate valid test suite: {str(e)}")

        # Validation
        await self.validate_test_suite(test_suite)

        await self.report_progress(
            progress_callback,
            100,
            "Test suite generation completed",
            "completed"
        )

        self.logger.info(
            "Test suite generated successfully",
            test_cases_count=len(test_suite.test_cases),
            coverage=test_suite.quality_metrics.code_coverage_percentage,
            maintainability=test_suite.quality_metrics.maintainability_index
        )

        return test_suite

    async def validate_test_suite(self, test_suite: TestSuite) -> bool:
        """
        Valide la suite de tests.

        Args:
            test_suite: Suite de tests à valider

        Returns:
            bool: True si valide

        Raises:
            ValueError: Si validation échoue
        """
        errors = []

        # Règle 1: Minimum 15 tests
        if len(test_suite.test_cases) < 15:
            errors.append(f"Minimum 15 test cases required, got {len(test_suite.test_cases)}")

        # Règle 2: Coverage >= 80%
        if test_suite.quality_metrics.code_coverage_percentage < 80:
            errors.append(
                f"Code coverage must be >= 80%, got {test_suite.quality_metrics.code_coverage_percentage}%"
            )

        # Règle 3: Au moins 3 types de tests
        test_types = set(tc.test_type for tc in test_suite.test_cases)
        if len(test_types) < 2:
            errors.append("Must have at least 2 different test types (Unit, Integration, E2E)")

        # Règle 4: Commandes de test présentes
        required_commands = ["unit", "coverage"]
        for cmd in required_commands:
            if cmd not in test_suite.test_commands:
                errors.append(f"Missing test command: {cmd}")

        # Règle 5: Configuration CI présente
        if not test_suite.ci_configuration or len(test_suite.ci_configuration) < 50:
            errors.append("CI configuration must be provided")

        if errors:
            self.logger.error("Test suite validation failed", errors=errors)
            raise ValueError(f"Test suite validation failed: {'; '.join(errors)}")

        return True
