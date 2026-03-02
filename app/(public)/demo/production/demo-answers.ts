/**
 * Réponses pré-répondues pour l'assistant sur la page démo publique.
 * Pas d'appel LLM en temps réel — évite les coûts sur la démo.
 */
export const DEMO_ANSWERS: Record<string, string> = {
  "Pourquoi mon TRS est-il en baisse cette semaine ?":
    "D'après les données affichées sur le dashboard, le TRS global et les TRS par ligne sont calculés à partir des sessions de production. Une baisse peut venir de **arrêts non planifiés** (disponibilité), d’un **ralentissement des cadences** (performance) ou d’un **taux de rebut** plus élevé (qualité). Consultez l’onglet **Lignes** pour identifier la ligne la plus impactée et l’onglet **Alertes** pour les événements récents (ex. TRS sous seuil). Je recommande de vérifier les arrêts sur la ligne concernée et de comparer avec la semaine précédente.",
  "Quelle ligne a le plus mauvais TRS ?":
    "Sur le dashboard, l’onglet **Vue globale** indique la **ligne à surveiller** (celle avec le TRS le plus bas) et l’onglet **Lignes** affiche le détail par ligne (TRS, disponibilité, performance, qualité). La ligne avec le TRS le plus faible est celle dont le **TRS %** est minimal dans le tableau. Concentrez les actions correctives sur cette ligne en priorité.",
  "Mes pertes matière sont-elles normales ?":
    "Le **taux de pertes matière** est affiché dans les métriques globales (évolution et indicateur dédié si présent). Une valeur typique en production alimentaire se situe souvent entre **2 % et 5 %** selon les process. Si le taux affiché dépasse 5 % ou augmente par rapport à la période précédente, il est utile d’analyser les causes (rebut, fuites, paramètres de ligne) et de consulter les **alertes actives** pour des événements liés aux pertes.",
  "Que me recommandes-tu pour améliorer la performance ?":
    "À partir des données du dashboard : 1) **Cibler la ligne la plus faible** (Vue globale / Lignes) et analyser disponibilité, performance et qualité. 2) **Traiter les alertes actives** (onglet Alertes) pour réduire les incidents non résolus. 3) **Viser un TRS cible** (ex. 80 %) en priorisant les arrêts courts et le taux de qualité. 4) **Suivre l’évolution TRS** sur 30 jours pour valider l’impact des actions. Les calculs passent par les indicateurs OEE (TRS, disponibilité, performance, qualité) affichés sur l’écran.",
};
