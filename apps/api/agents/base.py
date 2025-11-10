"""
Classe de base abstraite pour tous les agents.
Définit l'interface commune et les fonctionnalités partagées.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Callable
from datetime import datetime
import json
import asyncio

from pydantic import BaseModel
from config import settings, get_logger


logger = get_logger(__name__)


class BaseAgent(ABC):
    """
    Classe de base abstraite pour tous les agents spécialisés.

    Chaque agent hérite de cette classe et implémente :
    - system_prompt: Le prompt système définissant son rôle
    - execute(): La logique principale d'exécution
    """

    def __init__(self, openai_service: Any = None):
        """
        Initialise l'agent.

        Args:
            openai_service: Service OpenAI pour les appels LLM
        """
        self.openai_service = openai_service
        self.logger = get_logger(self.__class__.__name__)
        self.name = self.__class__.__name__.replace("Agent", "").lower()
        self.retry_count = 0
        self.max_retries = settings.max_retries
        self.timeout = settings.agent_timeout

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """
        Prompt système définissant le rôle et les règles de l'agent.
        Doit être implémenté par chaque agent.
        """
        pass

    @abstractmethod
    async def execute(self, input_data: Any, progress_callback: Optional[Callable] = None) -> BaseModel:
        """
        Exécute la logique principale de l'agent.

        Args:
            input_data: Données d'entrée (varie selon l'agent)
            progress_callback: Callback optionnel pour reporter la progression

        Returns:
            BaseModel: Output structuré de l'agent (ProjectPlan, TechnicalArchitecture, etc.)

        Raises:
            Exception: En cas d'erreur d'exécution
        """
        pass

    async def run_with_retry(
        self,
        input_data: Any,
        progress_callback: Optional[Callable] = None
    ) -> BaseModel:
        """
        Exécute l'agent avec retry automatique en cas d'échec.

        Args:
            input_data: Données d'entrée
            progress_callback: Callback pour progression

        Returns:
            BaseModel: Output de l'agent

        Raises:
            Exception: Si toutes les tentatives échouent
        """
        last_exception = None

        for attempt in range(self.max_retries + 1):
            try:
                self.retry_count = attempt

                if attempt > 0:
                    self.logger.warning(
                        f"Retry attempt {attempt}/{self.max_retries}",
                        agent=self.name
                    )
                    await asyncio.sleep(settings.retry_delay * attempt)

                # Exécution avec timeout
                result = await asyncio.wait_for(
                    self.execute(input_data, progress_callback),
                    timeout=self.timeout
                )

                self.logger.info(
                    f"Agent execution successful",
                    agent=self.name,
                    attempts=attempt + 1
                )

                return result

            except asyncio.TimeoutError as e:
                last_exception = e
                self.logger.error(
                    f"Agent execution timeout",
                    agent=self.name,
                    timeout=self.timeout,
                    attempt=attempt + 1
                )

            except Exception as e:
                last_exception = e
                self.logger.error(
                    f"Agent execution failed",
                    agent=self.name,
                    error=str(e),
                    attempt=attempt + 1
                )

        # Toutes les tentatives ont échoué
        raise Exception(
            f"Agent {self.name} failed after {self.max_retries + 1} attempts: {str(last_exception)}"
        )

    async def call_llm(
        self,
        user_message: str,
        context: Optional[Dict[str, Any]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Appelle le LLM OpenAI avec le system prompt de l'agent.

        Args:
            user_message: Message utilisateur
            context: Contexte additionnel à inclure
            temperature: Override de température
            max_tokens: Override de max tokens

        Returns:
            str: Réponse du LLM
        """
        if not self.openai_service:
            raise ValueError("OpenAI service not initialized")

        messages = [
            {"role": "system", "content": self.system_prompt}
        ]

        # Ajout du contexte si fourni
        if context:
            context_str = json.dumps(context, indent=2)
            messages.append({
                "role": "system",
                "content": f"Context:\n{context_str}"
            })

        messages.append({"role": "user", "content": user_message})

        self.logger.debug(
            "Calling LLM",
            agent=self.name,
            message_length=len(user_message)
        )

        response = await self.openai_service.chat_completion(
            messages=messages,
            temperature=temperature or settings.openai_temperature,
            max_tokens=max_tokens or settings.openai_max_tokens,
        )

        return response

    async def parse_llm_response(
        self,
        response: str,
        model_class: type[BaseModel]
    ) -> BaseModel:
        """
        Parse la réponse du LLM en un modèle Pydantic.

        Args:
            response: Réponse brute du LLM
            model_class: Classe Pydantic cible

        Returns:
            BaseModel: Instance du modèle parsé

        Raises:
            ValueError: Si le parsing échoue
        """
        try:
            # Essai de parsing JSON direct
            if response.strip().startswith("{"):
                data = json.loads(response)
                return model_class(**data)

            # Recherche d'un bloc JSON dans la réponse
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                return model_class(**data)

            raise ValueError("No valid JSON found in response")

        except Exception as e:
            self.logger.error(
                "Failed to parse LLM response",
                agent=self.name,
                error=str(e),
                response_preview=response[:200]
            )
            raise ValueError(f"Failed to parse response: {str(e)}")

    async def validate_output(self, output: BaseModel) -> bool:
        """
        Valide l'output de l'agent selon des règles métier.
        Peut être override par les agents pour des validations spécifiques.

        Args:
            output: Output à valider

        Returns:
            bool: True si valide

        Raises:
            ValueError: Si la validation échoue
        """
        # Validation Pydantic de base
        try:
            output.model_validate(output.model_dump())
            return True
        except Exception as e:
            raise ValueError(f"Output validation failed: {str(e)}")

    async def report_progress(
        self,
        callback: Optional[Callable],
        percentage: int,
        message: str,
        step: Optional[str] = None
    ):
        """
        Reporte la progression via le callback.

        Args:
            callback: Fonction callback
            percentage: Pourcentage de progression (0-100)
            message: Message descriptif
            step: Étape actuelle optionnelle
        """
        if callback:
            try:
                await callback({
                    "agent": self.name,
                    "percentage": percentage,
                    "message": message,
                    "step": step,
                    "timestamp": datetime.utcnow().isoformat()
                })
            except Exception as e:
                self.logger.warning(
                    "Failed to report progress",
                    agent=self.name,
                    error=str(e)
                )

    def get_metadata(self) -> Dict[str, Any]:
        """
        Retourne les métadonnées de l'agent.

        Returns:
            Dict: Métadonnées (nom, version, capabilities, etc.)
        """
        return {
            "name": self.name,
            "class": self.__class__.__name__,
            "version": "1.0.0",
            "timeout": self.timeout,
            "max_retries": self.max_retries,
        }

    def __repr__(self) -> str:
        """Représentation string de l'agent."""
        return f"<{self.__class__.__name__} name={self.name}>"
