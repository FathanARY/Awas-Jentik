"""
Simple in-memory TTL cache for expensive endpoints.
Invalidated on new laporan submissions via cache_bust().
"""

import time
from typing import Any, Callable, Dict, Optional

_cache: Dict[str, tuple[float, Any]] = {}

DEFAULT_TTL = 30  # seconds


def cache_get(key: str) -> Optional[Any]:
    entry = _cache.get(key)
    if entry is None:
        return None
    ts, value = entry
    if time.time() - ts > DEFAULT_TTL:
        del _cache[key]
        return None
    return value


def cache_set(key: str, value: Any) -> None:
    _cache[key] = (time.time(), value)


def cache_bust(prefix: str = "") -> None:
    """Remove cached entries. If prefix is empty, clears all."""
    if not prefix:
        _cache.clear()
    else:
        keys = [k for k in _cache if k.startswith(prefix)]
        for k in keys:
            del _cache[k]
