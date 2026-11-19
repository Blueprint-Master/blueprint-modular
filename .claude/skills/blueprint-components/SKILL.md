---
name: blueprint-components
description: Composer un artefact HTML, une page ou un tableau de bord avec Blueprint Modular. Utiliser pour un HTML autonome, un prototype local ou une vue connectée sur données métier, même lorsque le brief ne nomme pas de bibliothèque.
---

Identifier le besoin, les unités, le repère et les interactions attendues. Pour un artefact, commencer par `suggest_composition(need, target="html")` si le connecteur est présent. La documentation machine est disponible à https://blueprint-modular.com/llms.txt.

Utiliser le contrat et le rendu communs aux hôtes. Pour un fichier statique, exécuter le moteur `/artifacts/bpm-artifact.cjs` dans l’environnement de création. Lire son JSON Schema avec `--schema`, puis produire le HTML. Pour un rendu dynamique, charger `/artifacts/bpm.min.js`, appeler `BlueprintModular.mount(element, spec)` et fournir les mises à jour via `update(spec)` ou `refresh(load)`. Pour livrer hors ligne, inclure le script dans le HTML. Les chemins publics sont relatifs à https://blueprint-modular.com.

Lire [les instructions de composition](../../../public/artifacts/instructions.md) pour les limites du profil, la sélection des composants et les contrôles à faire. Une demande de suivi peut relire les valeurs, références et jugements par `view.context()` ou `bpm-artifact --inspect fichier.html`.
