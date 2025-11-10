"""
Agent Security - Expert en Sécurité Applicative
Analyse le code généré pour identifier les vulnérabilités de sécurité
et produire un rapport avec recommandations basé sur OWASP Top 10.
"""
from typing import Optional, Callable
import json

from .base import BaseAgent
from schemas.agents import CodebaseStructure, SecurityReport
from config import get_logger


logger = get_logger(__name__)


class SecurityAgent(BaseAgent):
    """
    Agent Security - Expert en Sécurité Applicative.

    Responsabilités:
    - Analyser le code pour les vulnérabilités
    - Vérifier la conformité OWASP Top 10
    - Identifier les risques de sécurité (XSS, SQL Injection, CSRF, etc.)
    - Proposer des corrections
    - Calculer un score de sécurité
    - Vérifier la conformité GDPR/réglementaire
    """

    @property
    def system_prompt(self) -> str:
        return """Tu es un Expert en Sécurité Applicative avec certification CISSP et 10 ans d'expérience en pentesting.
Tu analyses le code pour identifier les vulnérabilités et proposer des corrections.

## OBJECTIF
Analyser un codebase et générer un rapport de sécurité complet basé sur OWASP Top 10.

## MÉTHODOLOGIE

### 1. OWASP TOP 10 (2021)

Vérifier chaque catégorie:

1. **A01:2021 – Broken Access Control**
   - Contrôles d'accès manquants ou incorrects
   - Élévation de privilèges
   - IDOR (Insecure Direct Object References)

2. **A02:2021 – Cryptographic Failures**
   - Données sensibles non chiffrées
   - Algorithmes de chiffrement faibles
   - Gestion des clés insécure

3. **A03:2021 – Injection**
   - SQL Injection
   - NoSQL Injection
   - Command Injection
   - XSS (Cross-Site Scripting)

4. **A04:2021 – Insecure Design**
   - Manque de security patterns
   - Absence de threat modeling
   - Design patterns vulnérables

5. **A05:2021 – Security Misconfiguration**
   - Configuration par défaut non sécurisée
   - Messages d'erreur verbeux
   - CORS mal configuré

6. **A06:2021 – Vulnerable Components**
   - Dépendances obsolètes
   - CVE connus dans les packages

7. **A07:2021 – Identification and Authentication Failures**
   - Gestion de session faible
   - Pas de MFA
   - Mots de passe faibles acceptés

8. **A08:2021 – Software and Data Integrity Failures**
   - CI/CD non sécurisé
   - Dépendances non vérifiées
   - Auto-update non sécurisé

9. **A09:2021 – Security Logging Failures**
   - Logs insuffisants
   - Absence de monitoring
   - Pas d'alertes sur événements critiques

10. **A10:2021 – Server-Side Request Forgery (SSRF)**
    - URLs non validées
    - Accès non restreint aux ressources internes

### 2. ANALYSE DE CODE

Pour chaque fichier, vérifier:

**JavaScript/TypeScript**:
```typescript
// ❌ VULNÉRABLE - XSS
dangerouslySetInnerHTML={{ __html: userInput }}

// ✅ SÛR - Sanitization
import DOMPurify from 'dompurify';
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }}

// ❌ VULNÉRABLE - SQL Injection
db.query(`SELECT * FROM users WHERE id = ${userId}`)

// ✅ SÛR - Parameterized query
db.query('SELECT * FROM users WHERE id = $1', [userId])
```

**Python/FastAPI**:
```python
# ❌ VULNÉRABLE - SQL Injection
db.execute(f"SELECT * FROM users WHERE email = '{email}'")

# ✅ SÛR - ORM
db.query(User).filter(User.email == email).first()

# ❌ VULNÉRABLE - Weak password hashing
password_hash = hashlib.md5(password.encode()).hexdigest()

# ✅ SÛR - Bcrypt
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"])
password_hash = pwd_context.hash(password)
```

### 3. VÉRIFICATIONS SPÉCIFIQUES

**Authentication & Authorization**:
- JWT avec expiration
- Refresh tokens sécurisés
- RBAC (Role-Based Access Control)
- Rate limiting sur login

**Input Validation**:
- Validation côté serveur (jamais seulement client)
- Whitelist plutôt que blacklist
- Type checking strict

**Secrets Management**:
- Pas de secrets hardcodés
- Variables d'environnement
- Utilisation de secret managers

**HTTPS**:
- Force HTTPS
- HSTS headers
- Secure cookies (httpOnly, secure, sameSite)

**CORS**:
- Origins spécifiques (pas *)
- Credentials handling correct

**Rate Limiting**:
- Protection contre brute force
- DDoS mitigation

### 4. SCORE DE SÉCURITÉ

Calculer un score sur 100:
- 100: Aucune vulnérabilité, toutes best practices
- 80-99: Vulnérabilités mineures (Low/Info)
- 60-79: Vulnérabilités moyennes (Medium)
- 40-59: Vulnérabilités importantes (High)
- 0-39: Vulnérabilités critiques (Critical)

### 5. FORMAT DE SORTIE

Retourne UNIQUEMENT un JSON au format SecurityReport:

{
  "vulnerabilities": [
    {
      "vulnerability_id": "SEC-001",
      "severity": "High",
      "category": "A03:2021 – Injection",
      "title": "Potential SQL Injection in user query",
      "description": "User input is directly concatenated into SQL query without sanitization",
      "affected_files": ["api/routes/users.py"],
      "remediation": "Use ORM with parameterized queries instead of string concatenation",
      "cwe_id": "CWE-89"
    },
    ...
  ],
  "security_score": 75,
  "owasp_top10_coverage": {
    "A01:2021 - Broken Access Control": true,
    "A02:2021 - Cryptographic Failures": false,
    ...
  },
  "recommendations": [
    "Implement input validation middleware",
    "Add rate limiting to authentication endpoints",
    "Enable CORS with specific origins only"
  ],
  "compliance_checks": {
    "GDPR": true,
    "HTTPS_Only": true,
    "Secure_Headers": false
  }
}

## PRINCIPES CLÉS

- **Defense in Depth**: Plusieurs couches de sécurité
- **Least Privilege**: Accès minimum nécessaire
- **Fail Securely**: Échec vers un état sûr
- **No Security by Obscurity**: Pas de secret dans le code
- **Keep it Simple**: Complexité = vulnérabilités
"""

    async def execute(
        self,
        codebase: CodebaseStructure,
        progress_callback: Optional[Callable] = None
    ) -> SecurityReport:
        """
        Analyse le code et génère un rapport de sécurité.

        Args:
            codebase: Code à analyser
            progress_callback: Callback pour progression

        Returns:
            SecurityReport: Rapport de sécurité complet

        Raises:
            ValueError: Si l'analyse échoue
        """
        self.logger.info(
            "Starting security analysis",
            files_count=len(codebase.files)
        )

        await self.report_progress(
            progress_callback,
            10,
            "Preparing code for security analysis",
            "preparation"
        )

        # Préparer le résumé du code pour l'analyse
        code_summary = [
            {
                "path": f.path,
                "language": f.language,
                "content_preview": f.content[:500] if len(f.content) > 500 else f.content,
                "content_length": len(f.content)
            }
            for f in codebase.files[:20]  # Analyser les 20 premiers fichiers
        ]

        await self.report_progress(
            progress_callback,
            30,
            "Analyzing for OWASP Top 10 vulnerabilities",
            "owasp_analysis"
        )

        # Prompt pour l'analyse de sécurité
        security_prompt = f"""Analyse le codebase suivant pour les vulnérabilités de sécurité.

FICHIERS À ANALYSER:
{json.dumps(code_summary, indent=2)}

VARIABLES D'ENVIRONNEMENT:
{json.dumps(codebase.environment_variables, indent=2)}

DÉPENDANCES:
{json.dumps(codebase.dependencies, indent=2)}

Génère un rapport de sécurité avec:
- Analyse OWASP Top 10 complète
- Identification des vulnérabilités (minimum 3 si présentes)
- Score de sécurité réaliste (/100)
- Recommandations concrètes
- Vérifications de conformité (GDPR, HTTPS, etc.)

Sois exhaustif et précis dans l'identification des risques.

IMPORTANT: Retourne UNIQUEMENT le JSON au format SecurityReport."""

        await self.report_progress(
            progress_callback,
            60,
            "Checking compliance and security best practices",
            "compliance_check"
        )

        # Appel au LLM
        response = await self.call_llm(
            user_message=security_prompt,
            temperature=0.3,  # Plus déterministe pour la sécurité
            max_tokens=3000
        )

        await self.report_progress(
            progress_callback,
            80,
            "Generating security report",
            "report_generation"
        )

        # Parse de la réponse
        try:
            security_report = await self.parse_llm_response(response, SecurityReport)
        except Exception as e:
            self.logger.error("Failed to parse SecurityReport", error=str(e))
            raise ValueError(f"Failed to generate valid security report: {str(e)}")

        # Validation
        await self.validate_security_report(security_report)

        await self.report_progress(
            progress_callback,
            100,
            "Security analysis completed",
            "completed"
        )

        self.logger.info(
            "Security analysis completed",
            vulnerabilities_count=len(security_report.vulnerabilities),
            security_score=security_report.security_score,
            critical_count=sum(
                1 for v in security_report.vulnerabilities if v.severity == "Critical"
            )
        )

        return security_report

    async def validate_security_report(self, report: SecurityReport) -> bool:
        """
        Valide le rapport de sécurité.

        Args:
            report: Rapport à valider

        Returns:
            bool: True si valide

        Raises:
            ValueError: Si validation échoue
        """
        errors = []

        # Règle 1: Score entre 0 et 100
        if not (0 <= report.security_score <= 100):
            errors.append(f"Security score must be 0-100, got {report.security_score}")

        # Règle 2: Couverture OWASP Top 10
        if len(report.owasp_top10_coverage) < 10:
            errors.append("OWASP Top 10 coverage must include all 10 categories")

        # Règle 3: Recommandations présentes
        if len(report.recommendations) < 3:
            errors.append("Minimum 3 recommendations required")

        # Règle 4: Si vulnérabilités critiques, score doit être < 60
        critical_vulns = [v for v in report.vulnerabilities if v.severity == "Critical"]
        if critical_vulns and report.security_score >= 60:
            errors.append(
                f"Security score too high ({report.security_score}) with {len(critical_vulns)} critical vulnerabilities"
            )

        if errors:
            self.logger.error("Security report validation failed", errors=errors)
            raise ValueError(f"Security report validation failed: {'; '.join(errors)}")

        return True
