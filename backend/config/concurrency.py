"""
Concurrency configuration for the credentialing service.
"""

import os
from typing import Optional

class ConcurrencyConfig:
    """Configuration for concurrent request handling."""
    
    # Worker processes (default to CPU count)
    WORKERS: int = int(os.getenv("WORKERS", os.cpu_count() or 1))
    
    # Maximum concurrent connections per worker
    MAX_CONCURRENT_CONNECTIONS: int = int(os.getenv("MAX_CONCURRENT_CONNECTIONS", "1000"))
    
    # Maximum requests per worker before restart
    MAX_REQUESTS_PER_WORKER: int = int(os.getenv("MAX_REQUESTS_PER_WORKER", "1000"))
    
    # Keep-alive timeout in seconds
    KEEP_ALIVE_TIMEOUT: int = int(os.getenv("KEEP_ALIVE_TIMEOUT", "30"))
    
    # Rate limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", "200"))
    
    # Batch processing
    MAX_CONCURRENT_BATCH_REQUESTS: int = int(os.getenv("MAX_CONCURRENT_BATCH_REQUESTS", "10"))
    
    # LLM API concurrency
    MAX_CONCURRENT_LLM_REQUESTS: int = int(os.getenv("MAX_CONCURRENT_LLM_REQUESTS", "5"))
    
    # Database connection pool
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "20"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "30"))
    
    # File I/O concurrency
    MAX_CONCURRENT_FILE_OPERATIONS: int = int(os.getenv("MAX_CONCURRENT_FILE_OPERATIONS", "50"))
    
    # Session timeout
    SESSION_TIMEOUT_SECONDS: int = int(os.getenv("SESSION_TIMEOUT_SECONDS", "3600"))
    
    @classmethod
    def get_uvicorn_config(cls) -> dict:
        """Get uvicorn configuration for concurrent processing."""
        return {
            "workers": cls.WORKERS,
            "limit_concurrency": cls.MAX_CONCURRENT_CONNECTIONS,
            "limit_max_requests": cls.MAX_REQUESTS_PER_WORKER,
            "timeout_keep_alive": cls.KEEP_ALIVE_TIMEOUT,
            "loop": "asyncio",
            "http": "httptools",
            "ws": "websockets",
        }
    
    @classmethod
    def get_rate_limit_config(cls) -> dict:
        """Get rate limiting configuration."""
        return {
            "requests_per_minute": cls.RATE_LIMIT_REQUESTS_PER_MINUTE,
        }
    
    @classmethod
    def get_batch_config(cls) -> dict:
        """Get batch processing configuration."""
        return {
            "max_concurrent": cls.MAX_CONCURRENT_BATCH_REQUESTS,
        }

# Global concurrency semaphore for LLM requests
import asyncio
llm_semaphore = asyncio.Semaphore(ConcurrencyConfig.MAX_CONCURRENT_LLM_REQUESTS)

# Global concurrency semaphore for file operations
file_semaphore = asyncio.Semaphore(ConcurrencyConfig.MAX_CONCURRENT_FILE_OPERATIONS) 