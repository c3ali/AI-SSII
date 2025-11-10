"""
Service OpenAI pour les appels à l'API OpenAI.
Gère les appels chat completion et streaming.
"""
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from config import settings, get_logger


logger = get_logger(__name__)


class OpenAIService:
    """
    Service pour interagir avec l'API OpenAI.

    Fournit des méthodes pour:
    - Chat completion (text generation)
    - Streaming responses
    - Error handling et retry
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialise le service OpenAI.

        Args:
            api_key: Clé API OpenAI (utilise settings.openai_api_key si None)
        """
        self.api_key = api_key or settings.openai_api_key
        if not self.api_key:
            raise ValueError("OpenAI API key is required")

        self.client = AsyncOpenAI(api_key=self.api_key)
        self.logger = get_logger(__name__)

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Effectue un appel chat completion à OpenAI.

        Args:
            messages: Liste de messages (format OpenAI)
            model: Modèle à utiliser (défaut: settings.openai_model)
            temperature: Température de génération (défaut: settings.openai_temperature)
            max_tokens: Nombre max de tokens (défaut: settings.openai_max_tokens)
            response_format: Format de réponse (ex: {"type": "json_object"})

        Returns:
            str: Réponse générée

        Raises:
            Exception: Si l'appel échoue
        """
        model = model or settings.openai_model
        temperature = temperature if temperature is not None else settings.openai_temperature
        max_tokens = max_tokens or settings.openai_max_tokens

        self.logger.debug(
            "Calling OpenAI chat completion",
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            messages_count=len(messages)
        )

        try:
            # Préparer les paramètres
            params = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }

            # Ajouter response_format si spécifié
            if response_format:
                params["response_format"] = response_format

            # Appel API
            response = await self.client.chat.completions.create(**params)

            # Extraire le contenu
            content = response.choices[0].message.content

            self.logger.debug(
                "OpenAI response received",
                model=model,
                tokens_used=response.usage.total_tokens if response.usage else None,
                content_length=len(content) if content else 0
            )

            return content

        except Exception as e:
            self.logger.error(
                "OpenAI API call failed",
                model=model,
                error=str(e)
            )
            raise

    async def chat_completion_stream(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ):
        """
        Effectue un appel streaming à OpenAI.

        Args:
            messages: Liste de messages
            model: Modèle à utiliser
            temperature: Température
            max_tokens: Max tokens

        Yields:
            str: Chunks de la réponse
        """
        model = model or settings.openai_model
        temperature = temperature if temperature is not None else settings.openai_temperature
        max_tokens = max_tokens or settings.openai_max_tokens

        self.logger.debug("Starting OpenAI streaming", model=model)

        try:
            stream = await self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )

            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            self.logger.error("OpenAI streaming failed", error=str(e))
            raise

    async def count_tokens(self, text: str, model: Optional[str] = None) -> int:
        """
        Estime le nombre de tokens dans un texte.

        Note: Cette méthode utilise une approximation simple.
        Pour un comptage précis, utiliser tiktoken.

        Args:
            text: Texte à compter
            model: Modèle de référence

        Returns:
            int: Nombre estimé de tokens
        """
        # Approximation : 1 token ≈ 4 caractères en anglais
        # Pour plus de précision, utiliser tiktoken
        return len(text) // 4

    async def validate_api_key(self) -> bool:
        """
        Vérifie que la clé API est valide.

        Returns:
            bool: True si la clé est valide

        Raises:
            Exception: Si la validation échoue
        """
        try:
            # Test simple avec un appel minimal
            await self.chat_completion(
                messages=[{"role": "user", "content": "test"}],
                max_tokens=5
            )
            return True
        except Exception as e:
            self.logger.error("API key validation failed", error=str(e))
            raise


# Instance globale
_openai_service: Optional[OpenAIService] = None


def get_openai_service() -> OpenAIService:
    """
    Obtient l'instance globale du service OpenAI.

    Returns:
        OpenAIService: Instance du service
    """
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service
