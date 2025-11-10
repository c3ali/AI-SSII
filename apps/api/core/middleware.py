from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
from collections import defaultdict
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Simple in-memory rate limiting (use Redis in production)
rate_limit_store = defaultdict(list)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware"""

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = datetime.now()

        # Clean old entries
        rate_limit_store[client_ip] = [
            timestamp for timestamp in rate_limit_store[client_ip]
            if current_time - timestamp < timedelta(minutes=1)
        ]

        # Check rate limit
        if len(rate_limit_store[client_ip]) >= 100:  # 100 requests per minute
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )

        # Add current request
        rate_limit_store[client_ip].append(current_time)

        response = await call_next(request)
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Request logging middleware"""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Log request
        logger.info(f"➡️  {request.method} {request.url.path}")

        response = await call_next(request)

        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"⬅️  {request.method} {request.url.path} "
            f"- {response.status_code} - {process_time:.2f}s"
        )

        # Add process time header
        response.headers["X-Process-Time"] = str(process_time)

        return response
