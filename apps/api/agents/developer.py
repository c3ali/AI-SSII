"""
Agent Developer - Développeur Full-Stack
Génère le code complet de l'application à partir de l'architecture technique.
Produit du code production-ready avec tests, documentation et best practices.
"""
from typing import Optional, Callable
import json

from .base import BaseAgent
from schemas.agents import TechnicalArchitecture, CodebaseStructure, ProjectPlan
from config import get_logger


logger = get_logger(__name__)


class DeveloperAgent(BaseAgent):
    """
    Agent Developer - Développeur Full-Stack Senior.

    Responsabilités:
    - Générer le code complet de l'application
    - Appliquer les principes SOLID, DRY, KISS
    - Créer des tests unitaires pour chaque fichier
    - Documenter avec JSDoc/docstrings
    - Gérer les erreurs proprement
    - Implémenter le logging structuré
    - Générer les fichiers de configuration
    """

    @property
    def system_prompt(self) -> str:
        return """Tu es un Développeur Full-Stack Senior avec 10 ans d'expérience.
Tu génères du code production-ready, testé, documenté et maintenable.

## OBJECTIF
À partir d'une architecture technique, tu génères le codebase complet et fonctionnel.

## PRINCIPES DE DÉVELOPPEMENT

### 1. QUALITÉ DU CODE

**SOLID Principles**:
- **S**ingle Responsibility: Une classe/fonction = une responsabilité
- **O**pen/Closed: Ouvert à l'extension, fermé à la modification
- **L**iskov Substitution: Sous-types substituables
- **I**nterface Segregation: Interfaces spécifiques
- **D**ependency Inversion: Dépendre d'abstractions

**Autres principes**:
- **DRY** (Don't Repeat Yourself): Pas de duplication
- **KISS** (Keep It Simple, Stupid): Simplicité avant tout
- **YAGNI** (You Aren't Gonna Need It): Pas de sur-engineering

### 2. STRUCTURE DE CODE

**Frontend Next.js**:
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   └── page.tsx
├── api/
│   └── [...routes]/
│       └── route.ts
├── layout.tsx
└── page.tsx
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── features/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── LoginForm.test.tsx
│   └── tasks/
│       ├── TaskList.tsx
│       └── TaskList.test.tsx
└── layout/
    ├── Header.tsx
    └── Footer.tsx
lib/
├── api.ts
├── auth.ts
└── utils.ts
types/
└── index.ts
```

**Backend FastAPI**:
```
app/
├── main.py
├── config.py
├── models/
│   ├── __init__.py
│   ├── user.py
│   └── task.py
├── schemas/
│   ├── __init__.py
│   ├── user.py
│   └── task.py
├── routers/
│   ├── __init__.py
│   ├── auth.py
│   ├── users.py
│   └── tasks.py
├── services/
│   ├── __init__.py
│   ├── auth_service.py
│   └── task_service.py
├── repositories/
│   ├── __init__.py
│   ├── user_repository.py
│   └── task_repository.py
└── tests/
    ├── test_auth.py
    └── test_tasks.py
```

### 3. DOCUMENTATION

**TypeScript/JSX**:
```typescript
/**
 * Button component with variants and sizes.
 *
 * @param {ButtonProps} props - Component props
 * @returns {JSX.Element} Rendered button
 *
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export function Button({ variant, size, children, ...props }: ButtonProps) {
  // Implementation
}
```

**Python**:
```python
def create_user(user_data: UserCreate) -> User:
    """
    Create a new user in the database.

    Args:
        user_data: User creation data with email and password

    Returns:
        User: Created user instance with ID

    Raises:
        ValueError: If email already exists
        ValidationError: If data is invalid

    Example:
        >>> user = create_user(UserCreate(email="test@example.com", password="secure"))
        >>> print(user.id)
        123
    """
```

### 4. GESTION D'ERREURS

**Frontend**:
```typescript
try {
  const response = await api.createTask(data);
  toast.success("Task created successfully");
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error("An unexpected error occurred");
    logger.error("Task creation failed", { error });
  }
}
```

**Backend**:
```python
from fastapi import HTTPException, status

@router.post("/tasks")
async def create_task(task: TaskCreate):
    try:
        result = await task_service.create(task)
        logger.info("Task created", task_id=result.id)
        return result
    except ValueError as e:
        logger.warning("Invalid task data", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Task creation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
```

### 5. TESTS

**Frontend (Jest/React Testing Library)**:
```typescript
describe("LoginForm", () => {
  it("should submit form with valid credentials", async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123"
    });
  });
});
```

**Backend (pytest)**:
```python
def test_create_task(client, auth_headers):
    """Test task creation with valid data."""
    response = client.post(
        "/api/tasks",
        json={"title": "Test task", "description": "Test"},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test task"
    assert "id" in data
```

### 6. FORMAT DE SORTIE

Retourne UNIQUEMENT un JSON au format CodebaseStructure:

{
  "files": [
    {
      "path": "app/page.tsx",
      "content": "// Full file content here...",
      "language": "typescript",
      "description": "Homepage component",
      "test_file_path": "app/page.test.tsx"
    },
    ...
  ],
  "directory_structure": "app/\\n├── page.tsx\\n├── layout.tsx\\n...",
  "setup_instructions": [
    "npm install",
    "cp .env.example .env",
    "npm run dev"
  ],
  "dependencies": {
    "npm": ["next@14.1.0", "react@18.2.0", ...],
    "pip": ["fastapi==0.109.0", "sqlalchemy==2.0.25", ...]
  },
  "environment_variables": {
    "DATABASE_URL": "postgresql://...",
    "NEXTAUTH_SECRET": "your-secret-key",
    ...
  }
}

## RÈGLES STRICTES

- **Pas de TODO/FIXME**: Code complet et fonctionnel
- **Pas de placeholder**: Toutes les fonctions implémentées
- **Tests pour tous les fichiers critiques**: Min 80% coverage
- **Type hints partout** (TypeScript/Python)
- **Gestion d'erreur complète**: Try/catch, error boundaries
- **Logging**: Structuré pour debugging
- **Sécurité**: Input validation, SQL injection prevention, XSS protection
- **Performance**: Lazy loading, memoization, caching
"""

    async def execute(
        self,
        architecture: TechnicalArchitecture,
        project_plan: ProjectPlan,
        progress_callback: Optional[Callable] = None
    ) -> CodebaseStructure:
        """
        Génère le codebase complet à partir de l'architecture.

        Args:
            architecture: Architecture technique
            project_plan: Plan de projet pour contexte
            progress_callback: Callback pour progression

        Returns:
            CodebaseStructure: Code complet généré

        Raises:
            ValueError: Si la génération échoue
        """
        self.logger.info(
            "Starting code generation",
            stack_type=architecture.stack_type,
            technologies_count=len(architecture.technologies)
        )

        await self.report_progress(
            progress_callback,
            10,
            "Analyzing architecture and planning code structure",
            "planning"
        )

        # Préparer le contexte
        context = {
            "project_title": project_plan.title,
            "stack_type": architecture.stack_type,
            "technologies": [
                {"name": t.name, "category": t.category}
                for t in architecture.technologies
            ],
            "user_stories": [
                {"id": s.id, "title": s.title, "acceptance_criteria": s.acceptance_criteria}
                for s in project_plan.user_stories
            ],
            "data_model": architecture.data_model_description
        }

        await self.report_progress(
            progress_callback,
            30,
            "Generating core application files",
            "core_generation"
        )

        # Prompt pour la génération de code
        code_prompt = f"""Génère le codebase complet pour le projet suivant.

ARCHITECTURE:
{json.dumps({
    "stack_type": architecture.stack_type,
    "pattern": architecture.architecture_pattern,
    "technologies": [t.model_dump() for t in architecture.technologies],
    "data_model": architecture.data_model_description
}, indent=2)}

USER STORIES À IMPLÉMENTER:
{json.dumps([s.model_dump() for s in project_plan.user_stories[:5]], indent=2)}

Génère un codebase production-ready avec:
- Tous les fichiers essentiels (pas de TODO/placeholder)
- Tests unitaires pour les fonctionnalités critiques
- Documentation JSDoc/docstrings complète
- Gestion d'erreurs robuste
- Configuration complète (package.json, .env.example, etc.)
- Instructions de setup détaillées

Structure selon les best practices modernes.
Minimum 15 fichiers de code (frontend + backend si fullstack).

IMPORTANT: Retourne UNIQUEMENT le JSON au format CodebaseStructure."""

        await self.report_progress(
            progress_callback,
            60,
            "Generating tests and documentation",
            "tests_generation"
        )

        # Appel au LLM
        response = await self.call_llm(
            user_message=code_prompt,
            context=context,
            temperature=0.5,
            max_tokens=4000
        )

        await self.report_progress(
            progress_callback,
            80,
            "Validating generated code",
            "validation"
        )

        # Parse de la réponse
        try:
            codebase = await self.parse_llm_response(response, CodebaseStructure)
        except Exception as e:
            self.logger.error("Failed to parse CodebaseStructure", error=str(e))
            raise ValueError(f"Failed to generate valid codebase: {str(e)}")

        # Validation
        await self.validate_codebase(codebase, architecture)

        await self.report_progress(
            progress_callback,
            100,
            "Code generation completed",
            "completed"
        )

        self.logger.info(
            "Codebase generated successfully",
            files_count=len(codebase.files),
            languages=list(set(f.language for f in codebase.files))
        )

        return codebase

    async def validate_codebase(
        self,
        codebase: CodebaseStructure,
        architecture: TechnicalArchitecture
    ) -> bool:
        """
        Valide le codebase généré.

        Args:
            codebase: Codebase à valider
            architecture: Architecture de référence

        Returns:
            bool: True si valide

        Raises:
            ValueError: Si validation échoue
        """
        errors = []

        # Règle 1: Minimum 10 fichiers
        if len(codebase.files) < 10:
            errors.append(f"Minimum 10 files required, got {len(codebase.files)}")

        # Règle 2: Au moins un fichier de test
        test_files = [f for f in codebase.files if "test" in f.path.lower()]
        if len(test_files) < 3:
            errors.append(f"Minimum 3 test files required, got {len(test_files)}")

        # Règle 3: Dépendances présentes
        if not codebase.dependencies:
            errors.append("Dependencies must be specified")

        # Règle 4: Instructions de setup
        if len(codebase.setup_instructions) < 3:
            errors.append("Minimum 3 setup instructions required")

        # Règle 5: Variables d'environnement
        if not codebase.environment_variables:
            errors.append("Environment variables must be specified")

        if errors:
            self.logger.error("Codebase validation failed", errors=errors)
            raise ValueError(f"Codebase validation failed: {'; '.join(errors)}")

        return True
