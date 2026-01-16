"""
Error handling utilities for IDP plugin
"""

import time
import logging
from typing import Callable, Any, Optional, TypeVar
from functools import wraps

from idp_plugin.core.config import IDPConfig
from idp_plugin.core.exceptions import (
    IDPException,
    OCRProcessingError,
    ExtractionError,
    MappingError,
    StorageError
)

logger = logging.getLogger(__name__)

T = TypeVar('T')


def retry_on_failure(
    max_attempts: int = None,
    delay: int = None,
    exceptions: tuple = (Exception,)
):
    """
    Decorator for retrying operations on failure
    
    Args:
        max_attempts: Maximum retry attempts (default: from config)
        delay: Delay between retries in seconds (default: from config)
        exceptions: Exceptions to catch and retry
    """
    max_attempts = max_attempts or IDPConfig.LLM_RETRY_ATTEMPTS
    delay = delay or IDPConfig.LLM_RETRY_DELAY
    
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        logger.warning(
                            f"Attempt {attempt + 1} failed for {func.__name__}: {str(e)}. Retrying..."
                        )
                        time.sleep(delay)
                    else:
                        logger.error(
                            f"All {max_attempts} attempts failed for {func.__name__}: {str(e)}"
                        )
            
            raise last_exception
        
        return wrapper
    
    return decorator


def handle_timeout(timeout: int):
    """
    Decorator for handling timeouts
    
    Args:
        timeout: Timeout in seconds
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            # Note: Actual timeout handling would require async or threading
            # This is a placeholder for timeout logic
            return func(*args, **kwargs)
        
        return wrapper
    
    return decorator


def safe_default(default_value: Any):
    """
    Decorator for providing safe defaults on failure
    
    Args:
        default_value: Default value to return on failure
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Error in {func.__name__}: {str(e)}. Using default value.")
                return default_value
        
        return wrapper
    
    return decorator





