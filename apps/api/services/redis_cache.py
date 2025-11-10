"""
Service Redis pour le caching et la gestion des queues/jobs.
"""
from typing import Optional, Any
import json
from redis import asyncio as aioredis
from config import settings, get_logger


logger = get_logger(__name__)


class RedisService:
    """
    Service Redis pour caching et job queue.

    Fonctionnalités:
    - Cache clé-valeur
    - Expiration automatique
    - Job queue pour workflows async
    - Pub/Sub pour WebSocket updates
    """

    def __init__(self, redis_url: Optional[str] = None):
        """
        Initialise le service Redis.

        Args:
            redis_url: URL de connexion Redis (utilise settings.redis_url si None)
        """
        self.redis_url = redis_url or settings.redis_url
        self.logger = get_logger(__name__)
        self.redis: Optional[aioredis.Redis] = None

    async def connect(self):
        """Établit la connexion à Redis."""
        if self.redis is None:
            self.redis = await aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=settings.redis_max_connections
            )
            self.logger.info("Redis connection established")

    async def disconnect(self):
        """Ferme la connexion Redis."""
        if self.redis:
            await self.redis.close()
            self.logger.info("Redis connection closed")

    async def get(self, key: str) -> Optional[Any]:
        """
        Récupère une valeur du cache.

        Args:
            key: Clé du cache

        Returns:
            Any: Valeur désérialisée ou None
        """
        if not self.redis:
            await self.connect()

        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            self.logger.error("Redis GET failed", key=key, error=str(e))
            return None

    async def set(
        self,
        key: str,
        value: Any,
        expire_seconds: Optional[int] = None
    ) -> bool:
        """
        Stocke une valeur dans le cache.

        Args:
            key: Clé du cache
            value: Valeur à stocker (sera sérialisée en JSON)
            expire_seconds: Durée de vie en secondes (optionnel)

        Returns:
            bool: True si succès
        """
        if not self.redis:
            await self.connect()

        try:
            serialized = json.dumps(value)
            if expire_seconds:
                await self.redis.setex(key, expire_seconds, serialized)
            else:
                await self.redis.set(key, serialized)
            return True
        except Exception as e:
            self.logger.error("Redis SET failed", key=key, error=str(e))
            return False

    async def delete(self, key: str) -> bool:
        """
        Supprime une clé du cache.

        Args:
            key: Clé à supprimer

        Returns:
            bool: True si la clé existait et a été supprimée
        """
        if not self.redis:
            await self.connect()

        try:
            result = await self.redis.delete(key)
            return result > 0
        except Exception as e:
            self.logger.error("Redis DELETE failed", key=key, error=str(e))
            return False

    async def exists(self, key: str) -> bool:
        """
        Vérifie si une clé existe.

        Args:
            key: Clé à vérifier

        Returns:
            bool: True si la clé existe
        """
        if not self.redis:
            await self.connect()

        try:
            result = await self.redis.exists(key)
            return result > 0
        except Exception as e:
            self.logger.error("Redis EXISTS failed", key=key, error=str(e))
            return False

    async def increment(self, key: str, amount: int = 1) -> int:
        """
        Incrémente une valeur numérique.

        Args:
            key: Clé à incrémenter
            amount: Montant de l'incrémentation

        Returns:
            int: Nouvelle valeur après incrémentation
        """
        if not self.redis:
            await self.connect()

        try:
            return await self.redis.incrby(key, amount)
        except Exception as e:
            self.logger.error("Redis INCRBY failed", key=key, error=str(e))
            raise

    async def expire(self, key: str, seconds: int) -> bool:
        """
        Définit une expiration sur une clé existante.

        Args:
            key: Clé
            seconds: Durée de vie en secondes

        Returns:
            bool: True si succès
        """
        if not self.redis:
            await self.connect()

        try:
            return await self.redis.expire(key, seconds)
        except Exception as e:
            self.logger.error("Redis EXPIRE failed", key=key, error=str(e))
            return False

    # ========================================================================
    # GESTION DE QUEUES (Job Queue)
    # ========================================================================

    async def enqueue_job(self, queue_name: str, job_data: dict) -> bool:
        """
        Ajoute un job à une queue.

        Args:
            queue_name: Nom de la queue
            job_data: Données du job

        Returns:
            bool: True si succès
        """
        if not self.redis:
            await self.connect()

        try:
            serialized = json.dumps(job_data)
            await self.redis.rpush(queue_name, serialized)
            return True
        except Exception as e:
            self.logger.error(
                "Redis enqueue failed",
                queue=queue_name,
                error=str(e)
            )
            return False

    async def dequeue_job(self, queue_name: str, timeout: int = 0) -> Optional[dict]:
        """
        Récupère un job de la queue (FIFO).

        Args:
            queue_name: Nom de la queue
            timeout: Timeout en secondes (0 = non-bloquant)

        Returns:
            dict: Données du job ou None
        """
        if not self.redis:
            await self.connect()

        try:
            if timeout > 0:
                result = await self.redis.blpop(queue_name, timeout)
                if result:
                    _, job_data = result
                    return json.loads(job_data)
            else:
                job_data = await self.redis.lpop(queue_name)
                if job_data:
                    return json.loads(job_data)
            return None
        except Exception as e:
            self.logger.error(
                "Redis dequeue failed",
                queue=queue_name,
                error=str(e)
            )
            return None

    async def queue_length(self, queue_name: str) -> int:
        """
        Retourne la longueur d'une queue.

        Args:
            queue_name: Nom de la queue

        Returns:
            int: Nombre de jobs dans la queue
        """
        if not self.redis:
            await self.connect()

        try:
            return await self.redis.llen(queue_name)
        except Exception as e:
            self.logger.error(
                "Redis queue length failed",
                queue=queue_name,
                error=str(e)
            )
            return 0

    # ========================================================================
    # PUB/SUB (Pour WebSocket updates)
    # ========================================================================

    async def publish(self, channel: str, message: dict) -> int:
        """
        Publie un message sur un channel.

        Args:
            channel: Nom du channel
            message: Message à publier

        Returns:
            int: Nombre de subscribers qui ont reçu le message
        """
        if not self.redis:
            await self.connect()

        try:
            serialized = json.dumps(message)
            return await self.redis.publish(channel, serialized)
        except Exception as e:
            self.logger.error(
                "Redis publish failed",
                channel=channel,
                error=str(e)
            )
            return 0

    async def subscribe(self, channel: str):
        """
        S'abonne à un channel (retourne un async generator).

        Args:
            channel: Nom du channel

        Yields:
            dict: Messages reçus sur le channel
        """
        if not self.redis:
            await self.connect()

        pubsub = self.redis.pubsub()
        try:
            await pubsub.subscribe(channel)
            async for message in pubsub.listen():
                if message["type"] == "message":
                    yield json.loads(message["data"])
        finally:
            await pubsub.unsubscribe(channel)
            await pubsub.close()

    async def health_check(self) -> bool:
        """
        Vérifie que la connexion Redis fonctionne.

        Returns:
            bool: True si connexion OK
        """
        if not self.redis:
            await self.connect()

        try:
            await self.redis.ping()
            self.logger.debug("Redis health check passed")
            return True
        except Exception as e:
            self.logger.error("Redis health check failed", error=str(e))
            raise


# Instance globale
_redis_service: Optional[RedisService] = None


def get_redis_service() -> RedisService:
    """
    Obtient l'instance globale du service Redis.

    Returns:
        RedisService: Instance du service
    """
    global _redis_service
    if _redis_service is None:
        _redis_service = RedisService()
    return _redis_service
