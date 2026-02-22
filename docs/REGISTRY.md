# Registry : `$` et `@`

**Objectif** : aucun framework (Streamlit, Dash, etc.) ne propose nativement une **registry** avec deux opérateurs sémantiques — **`$`** (réfs réactives / état ciblé) et **`@`** (décorateurs / inscription de composants ou de blocs).

---

## 1. `$` — Réfs réactives / état

- **Sémantique** : `$nom` désigne une **référence réactive** (une cellule d’état) à laquelle on peut lire/écrire. Seuls les composants qui **dépendent** de cette ref se mettent à jour quand sa valeur change (réactivité granulaire).
- **Usage prévu** :
  - `bpm.$("compteur")` → ref vers une valeur (ex. entier) ; `bpm.$("compteur").set(42)` ou `.get()`.
  - En Python : `bpm.ref("compteur")` ou syntaxe courte si on expose `$` (ex. `bpm.$compteur` ou variable `$compteur` selon le runtime).
- **Différence avec Streamlit** : pas de re-run complet du script ; seules les parties du UI liées à cette ref sont mises à jour.

**Stub / API cible** :
- `bpm.ref(name)` → retourne une ref (objet avec `.get()`, `.set(value)`, optionnellement `.subscribe(callback)`).
- Le frontend (ou le runtime BPM) maintient un store : `name → value` ; les widgets enregistrés avec `@` ou déclarés avec cette ref se rafraîchissent quand la valeur change.

---

## 2. `@` — Décorateurs / inscription

- **Sémantique** : `@nom` sert à **enregistrer** un bloc (composant, fonction, section) dans la registry BPM. Utile pour :
  - **Réutilisation** : `@sidebar`, `@header`, `@page("rapports")` ;
  - **Injection** : le layout peut appeler « rends le bloc enregistré sous `@sidebar` » ;
  - **Décorateurs Python** : `@bpm.page("rapports")`, `@bpm.sidebar`, `@bpm.cache_data`.
- **Usage prévu** :
  - En Python : `@bpm.page("rapports")` définit une page nommée "rapports" ; le routeur BPM affiche cette page quand la route correspond.
  - `@bpm.sidebar` enregistre le contenu de la sidebar ; `Layout` lit la config + la registry et affiche ce contenu.
- **Différence avec les frameworks classiques** : la registry est un premier citoyen (nommage explicite, réutilisation par nom), pas seulement des composants déclaratifs sans identité.

**Stub / API cible** :
- `bpm.register(name, value)` ou `bpm.@(name, value)` → enregistre `value` sous `name`.
- `bpm.get_registered(name)` → retourne la valeur enregistrée.
- Décorateurs : `@bpm.page("id")`, `@bpm.sidebar`, `@bpm.cache_data` enregistrent la fonction ou le bloc sous ce nom.

---

## 3. Synthèse

| Symbole | Rôle | Exemple |
|---------|------|--------|
| `$` | Réf réactive (état ciblé, mise à jour granulaire) | `bpm.ref("filtre_date").set(d)` |
| `@` | Inscription dans la registry (blocs, pages, sidebar) | `@bpm.page("rapports")`, `@bpm.sidebar` |

L’implémentation côté **Python** peut exposer :
- `bpm.ref(name)` et éventuellement une forme courte pour `$` ;
- `bpm.register(name, value)` et des décorateurs `@bpm.page`, `@bpm.sidebar`, etc.

Un **stub** de package Python (`bpm/__init__.py`) est fourni pour définir ces APIs et les implémenter progressivement.

---

## 4. Fichiers

- **Stub Python** : `bpm/__init__.py` (refs, register, décorateurs vides ou minimalistes).
- **Doc** : ce fichier `docs/REGISTRY.md`.

---

*Voir aussi : `docs/REACTIVITE_GRANULAIRE.md`, `docs/APP_CONFIG.md`, `docs/ROADMAP.md`.*
