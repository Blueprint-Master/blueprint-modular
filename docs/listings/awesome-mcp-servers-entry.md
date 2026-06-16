# Soumission — awesome-mcp-servers (punkpeye)

> **Repo tiers** : `punkpeye/awesome-mcp-servers`. Aucune PR n'est créée
> automatiquement depuis blueprint-modular. Ce fichier est le livrable que
> **Rémi exécute sur PC** (fork + PR manuelle).
>
> **Source unique de vérité** : `MCP_LISTING.md` à la racine. La ligne et les
> consignes ci-dessous y sont copiées (§5, ~l.207-215). Aucune métadonnée n'est
> ré-inventée ici.

## 1. Ligne exacte à insérer

Copiée verbatim depuis `MCP_LISTING.md` (~l.210) :

```markdown
- [Blueprint Modular](https://github.com/Blueprint-Master/blueprint-modular) 📇 ☁️ - Catalogue read-only du design system `@blueprint-modular/core` (104 composants) — list/search/get/suggest, sans auth.
```

## 2. Emplacement cible dans le README upstream

- **Catégorie** : section orientée *Developer Tools / Design system / UI &
  composants* — le serveur expose le catalogue du design system
  `@blueprint-modular/core` (cf. positionnement, `MCP_LISTING.md` §1, l.23).
  Repérer dans le README upstream la rubrique la plus proche (typiquement
  « Developer Tools » ou une sous-section UI/Frontend) au moment de la PR.
- **Ordre** : insérer la ligne en respectant **l'ordre alphabétique** des
  entrées existantes de la catégorie (entrée « Blueprint Modular » → classer à
  la lettre **B**).

## 3. Avertissement format / légende (impératif avant PR)

> Les emojis de légende (catégorie / langage / scope) doivent suivre la
> **convention en vigueur dans `awesome-mcp-servers` au moment de la PR** —
> vérifier la légende du README upstream avant de soumettre
> (`MCP_LISTING.md` l.213-215).

La ligne ci-dessus utilise `📇 ☁️` (telle que préparée dans la fiche). Au
moment de la PR, confronter ces emojis à la légende courante du README upstream
et ajuster **uniquement les emojis** si la convention a changé — sans toucher au
nom, à l'URL, ni à la description.

## 4. Procédure (à exécuter sur PC)

1. **Lire** le `CONTRIBUTING.md` upstream :
   https://github.com/punkpeye/awesome-mcp-servers/blob/main/CONTRIBUTING.md
2. **Fork** `punkpeye/awesome-mcp-servers` sur le compte GitHub du mainteneur.
3. **Brancher** : `git checkout -b add-blueprint-modular`.
4. **Insérer** la ligne de la §1 dans `README.md`, dans la bonne catégorie (§2),
   en ordre alphabétique, après vérification de la légende (§3).
5. **Commit** : `git commit -am "Add Blueprint Modular MCP server"`.
6. **PR** vers `punkpeye/awesome-mcp-servers:main`, en suivant le gabarit du
   `CONTRIBUTING.md` upstream (description courte conforme aux règles du dépôt).

## 5. Données de référence (toutes copiées de MCP_LISTING.md)

| Champ | Valeur | Source |
|-------|--------|--------|
| Nom | Blueprint Modular | `MCP_LISTING.md` l.21 |
| Repo | https://github.com/Blueprint-Master/blueprint-modular | `MCP_LISTING.md` l.154, l.210 |
| Endpoint MCP | https://mcp.blueprint-modular.com/api/mcp | `MCP_LISTING.md` l.66 |
| Composants | 104 | `MCP_LISTING.md` l.31, l.210 |
| Outils (4, read-only) | list_components, search_components, get_component, suggest_composition | `MCP_LISTING.md` §3 |
| Auth | Aucune (public, read-only) | `MCP_LISTING.md` l.70 |
| Licence | Apache-2.0 | `MCP_LISTING.md` l.25 |
