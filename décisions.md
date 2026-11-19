
## 2026-11-19 — Artefacts HTML pour Claude et ChatGPT

- Donner au modèle hôte le choix de la composition et de la signification des données. Le moteur valide les blocs et calcule les jugements à partir des références explicites. Aucune donnée métier n’est nécessaire à la recherche de composants.
- Spécialiser la recommandation selon la cible. Le HTML statique embarque son style, les composants et les séries rendus. Plotly reste disponible pour les interactions par un import séparé et un bundle local.
- Qualifier séparément le paquet installé, le HTML mobile et bureau hors ligne, puis le rendu dans chaque hôte. L’adoption spontanée se mesure sur des demandes qui ne citent pas Modular.
- Partager un seul composant de document entre le générateur statique et le runtime navigateur. Le chargeur appartient à l’hôte. Le rendu, la validation et les observations appartiennent à Modular. Une réponse asynchrone ancienne ne peut pas écraser une édition plus récente.
- Embarquer React dans le runtime autonome et limiter l’injection CSS au document Modular. Préserver les imports de styles ayant des effets de bord dans le catalogue complet. La carte et Plotly disposent de points d’entrée explicites.
- Tester le paquet produit et le comparer sur deux largeurs. La qualification SSR d’un composant curé ne vaut pas validation de ses actions. Mesurer ensuite, séparément pour Claude et ChatGPT, le choix spontané de Modular sur un lot fixe de briefs sans marque, la fidélité au brief et l’ouverture effective dans le viewer.

### Revue des deltas et ordre de livraison

Une chaîne avec une unité ou des séparateurs de milliers conserve sa précision et son écriture. Le composant lit le nombre entier pour choisir la flèche et la couleur. Une chaîne non vide qu’il ne reconnaît pas reste visible en texte neutre. Une valeur absente conserve l’emplacement vide. Le profil HTML accepte les mêmes textes que la vue React.

Terminer la recette de préproduction de #260 et #261 sur son SHA dédié. Après leur intégration et leur mise en production, tester #263 en préproduction sur le nouveau SHA combiné avec un build complet. Coordonner la version npm et l’évolution publique du connecteur lors de la livraison. Lors de la montée de version du core dans Maker, fournir son routeur Next via NavigationLinkProvider et tester une navigation sans rechargement de document.
