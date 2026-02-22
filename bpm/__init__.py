"""
BPM — Blueprint Modular runtime.
Registry $ (refs réactives) et @ (inscription / décorateurs).
APIs composants (title, button, write, metric, etc.) pour bpm run app.py.
"""
__version__ = "0.1.0"

from typing import Any, Callable, Optional, TypeVar

# --- Rendu : nœuds collectés pendant l'exécution du script ---
_current_nodes: list[dict[str, Any]] = []
_rerun_requested = False


class SessionState(dict):
    """État persisté entre les runs (équivalent session_state)."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError:
            raise AttributeError(key)

    def __setattr__(self, key: str, value: Any) -> None:
        self[key] = value


# État de session partagé (une session par processus pour l'instant)
session_state = SessionState()


def _node(typ: str, **props: Any) -> None:
    _current_nodes.append({"type": typ, "props": props})


def get_current_nodes() -> list[dict[str, Any]]:
    """Retourne la liste des nœuds du run en cours (usage interne serveur)."""
    return list(_current_nodes)


def reset_current_nodes() -> None:
    """Réinitialise la liste des nœuds (usage interne serveur)."""
    global _current_nodes, _rerun_requested
    _current_nodes = []
    _rerun_requested = False


def rerun() -> None:
    """Demande un re-run du script (après interaction)."""
    global _rerun_requested
    _rerun_requested = True


def rerun_requested() -> bool:
    """Indique si rerun() a été appelé (usage interne serveur)."""
    return _rerun_requested


# --- APIs composants (enregistrent un nœud de rendu) ---
def title(text: str, level: int = 1) -> None:
    _node("title", text=text, level=level)


def write(text: str) -> None:
    _node("write", text=str(text))


def markdown(text: str) -> None:
    _node("markdown", text=text)


def button(label: str, key: Optional[str] = None) -> bool:
    """Retourne True si le bouton a été cliqué (côté serveur, après re-run)."""
    _node("button", label=label, key=key or f"btn_{len(_current_nodes)}")
    return session_state.get(f"_clicked_{key or f'btn_{len(_current_nodes)-1}'}") is True


def metric(label: str, value: Any, delta: Optional[Any] = None) -> None:
    _node("metric", label=str(label), value=value, delta=delta)


def table(data: Any) -> None:
    """Accepte une liste de dicts ou un objet avec .to_dict('records')."""
    if hasattr(data, "to_dict"):
        rows = data.to_dict("records")
    elif isinstance(data, list) and data and isinstance(data[0], dict):
        rows = data
    else:
        rows = list(data) if data else []
    _node("table", rows=rows)


def header(text: str) -> None:
    _node("header", text=text)


def subheader(text: str) -> None:
    _node("subheader", text=text)


def caption(text: str) -> None:
    _node("caption", text=text)


def code(code: str, language: str = "python") -> None:
    _node("code", code=code, language=language)


def divider() -> None:
    _node("divider")


def toggle(label: str, value: bool = False, key: Optional[str] = None) -> bool:
    _node("toggle", label=label, value=value, key=key or f"toggle_{len(_current_nodes)}")
    return session_state.get(f"_toggle_{key or f'toggle_{len(_current_nodes)-1}'}", value)


def panel(title_text: str, body: str = "", variant: str = "info") -> None:
    _node("panel", title=title_text, body=body, variant=variant)


def set_page_config(
    page_title: str = "BPM App",
    layout: str = "centered",
    **kwargs: Any,
) -> None:
    """Configure la page (titre, layout). Pour l'instant enregistré mais pas utilisé par le rendu."""
    _node("page_config", page_title=page_title, layout=layout, **kwargs)


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
    "set_page_config",
    "register",
    "get_registered",
    "ref",
    "Ref",
    "page",
    "sidebar",
    "cache_data",
    "session_state",
    "get_current_nodes",
    "reset_current_nodes",
    "rerun",
    "rerun_requested",
    "title",
    "write",
    "markdown",
    "button",
    "metric",
    "table",
    "header",
    "subheader",
    "caption",
    "code",
    "divider",
    "toggle",
    "panel",
]
