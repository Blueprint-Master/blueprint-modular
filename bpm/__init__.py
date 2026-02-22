"""
BPM — Blueprint Modular runtime (stub).
Registry $ (refs réactives) et @ (inscription / décorateurs).
À étendre pour bpm run, composants, etc.
"""
from typing import Any, Callable, Optional, TypeVar

# --- Registry @ : stockage par nom ---
_REGISTRY: dict[str, Any] = {}


def register(name: str, value: Any) -> None:
    """Enregistre une valeur sous un nom (@)."""
    _REGISTRY[name] = value


def get_registered(name: str) -> Any:
    """Retourne la valeur enregistrée sous ce nom."""
    return _REGISTRY.get(name)


# --- Refs réactives $ ---
_REFS: dict[str, Any] = {}
_REF_SUBSCRIBERS: dict[str, list[Callable[[Any], None]]] = {}


class Ref:
    """Réf réactive : get/set/subscribe."""

    def __init__(self, name: str, initial: Any = None):
        self._name = name
        if name not in _REFS:
            _REFS[name] = initial
        if name not in _REF_SUBSCRIBERS:
            _REF_SUBSCRIBERS[name] = []

    def get(self) -> Any:
        return _REFS.get(self._name)

    def set(self, value: Any) -> None:
        _REFS[self._name] = value
        for cb in _REF_SUBSCRIBERS.get(self._name, []):
            cb(value)

    def subscribe(self, callback: Callable[[Any], None]) -> Callable[[], None]:
        _REF_SUBSCRIBERS.setdefault(self._name, []).append(callback)

        def unsubscribe():
            _REF_SUBSCRIBERS[self._name].remove(callback)

        return unsubscribe


def ref(name: str, initial: Any = None) -> Ref:
    """Crée ou récupère une ref réactive ($)."""
    return Ref(name, initial)


# --- Décorateurs @ ---
F = TypeVar("F", bound=Callable[..., Any])


def page(page_id: str) -> Callable[[F], F]:
    """Décorateur : enregistre une fonction comme page (@bpm.page('id'))."""

    def decorator(fn: F) -> F:
        register(f"page:{page_id}", fn)
        return fn

    return decorator


def sidebar(fn: F) -> F:
    """Décorateur : enregistre le contenu de la sidebar (@bpm.sidebar)."""
    register("sidebar", fn)
    return fn


def cache_data(fn: F) -> F:
    """Décorateur : cache le résultat de la fonction (@bpm.cache_data). Stub : pas de cache pour l'instant."""
    return fn


__all__ = [
    "register",
    "get_registered",
    "ref",
    "Ref",
    "page",
    "sidebar",
    "cache_data",
]
