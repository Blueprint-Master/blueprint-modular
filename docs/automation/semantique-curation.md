# Couche sémantique — surface de curation

> **Décision de moat.** Les valeurs ci-dessous sont des PROPOSITIONS de la boucle
> (draftées depuis les descriptions existantes du registre). L'ontologie reste curée :
> valider ou corriger chaque ligne dans `lib/semantics/bpm-semantics.json`, passer
> `status` à `curated` (ou corriger les valeurs), puis régénérer et valider :
> `npm run generate:llms && npm run generate:mcp-registry && python3 scripts/validate-semantics.py --write-ledger`.
>
> Frames Ω = tranches de l'AppSpec (`packages/core/src/schema/app-spec.ts`),
> câblage typé dans `lib/semantics/types.ts` (FRAME_SOURCE).

## Questions ouvertes (needs-curation)

- **bpm.avatar** — Ω n'a pas de frame « acteur » : avatar (et orgChart) sont rattachés à entity par défaut. Faut-il introduire un frame acteur/identité dans le seed Ω, ou les rattacher à permission (Role) ?
- **bpm.timeline** — timeline (et activityFeed) : simple affichage d'événements ou indicateur de charge/fréquence (compte d'événements par période) ? Trancher si un bloc indicateur doit être porté et avec quelle temporalité.
- **bpm.activityFeed** — activityFeed (et timeline) : simple affichage d'événements ou indicateur d'activité (fréquence/volume par période) ? Trancher si un bloc indicateur doit être porté.
- **bpm.orgChart** — Ω n'a pas de frame « acteur » : orgChart (et avatar) sont rattachés à entity par défaut. Faut-il introduire un frame acteur/identité dans le seed Ω, ou les rattacher à permission (Role) ?
- **bpm.plotlyChart** — plotlyChart est LE graphique des apps générées mais son sens dépend de la trace : faut-il décliner la sémantique par usage (sous-types tendance/distribution/jauge) plutôt qu'un indicatorType multiple avec direction/temporalité contextuelles ?
- **bpm.barcode** — Identification & traçabilité (barcode/qrCode/nfcBadge) : Ω n'a pas de frame identification. Rattachement proposé à connector (pont physique↔numérique) — valider, ou rattacher à entity (identifiant), ou créer un frame dédié dans le seed Ω ?
- **bpm.qrCode** — Identification & traçabilité (barcode/qrCode/nfcBadge) : Ω n'a pas de frame identification. Rattachement proposé à connector — valider, ou rattacher à entity, ou créer un frame dédié ?
- **bpm.nfcBadge** — Identification & traçabilité (barcode/qrCode/nfcBadge) : Ω n'a pas de frame identification. Rattachement proposé à connector — valider, ou rattacher à entity, ou créer un frame dédié ?
- **bpm.diffViewer** — diffViewer : frame ai (revue de sorties IA, catégorie actuelle) ou entity (versionnage de données métier) ? Le rattachement détermine ses associations sémantiques.

## Valeurs proposées par composant

| Composant | Rôle | Frame Ω | Type d'indicateur | Direction | Temporalité | Relations d'indicateurs | Statut |
|---|---|---|---|---|---|---|---|
| bpm.metric | indicateur | kpi | scalaire-kpi, monetaire, compte, taux | contextuel | instantane | derive-de → bpm.lineChart; contraste-avec → bpm.progress | proposed |
| bpm.table | affichage | entity | — | — | — | — | proposed |
| bpm.title | affichage | section | — | — | — | — | proposed |
| bpm.title1 | affichage | section | — | — | — | — | proposed |
| bpm.title2 | affichage | section | — | — | — | — | proposed |
| bpm.title3 | affichage | section | — | — | — | — | proposed |
| bpm.text | affichage | section | — | — | — | — | proposed |
| bpm.caption | affichage | section | — | — | — | — | proposed |
| bpm.badge | indicateur | workflow | statut | neutre | instantane | compose-dans → bpm.statusTracker; contraste-avec → bpm.statusBox | proposed |
| bpm.progress | indicateur | kpi | progression, taux | borne-cible | cumule | derive-de → bpm.metric; contraste-avec → bpm.statusTracker | proposed |
| bpm.skeleton | feedback | section | — | — | — | — | proposed |
| bpm.jsonViewer | affichage | entity | — | — | — | — | proposed |
| bpm.avatar | affichage | entity | — | — | — | — | **needs-curation** |
| bpm.panel | feedback | section | — | — | — | — | proposed |
| bpm.tabs | conteneur | section | — | — | — | — | proposed |
| bpm.expander | conteneur | section | — | — | — | — | proposed |
| bpm.accordion | conteneur | section | — | — | — | — | proposed |
| bpm.card | conteneur | section | — | — | — | — | proposed |
| bpm.highlightBox | conteneur | section | — | — | — | — | proposed |
| bpm.divider | affichage | section | — | — | — | — | proposed |
| bpm.grid | conteneur | section | — | — | — | — | proposed |
| bpm.column | conteneur | section | — | — | — | — | proposed |
| bpm.emptyState | feedback | entity | — | — | — | — | proposed |
| bpm.container | conteneur | section | — | — | — | — | proposed |
| bpm.empty | feedback | entity | — | — | — | — | proposed |
| bpm.popover | conteneur | section | — | — | — | — | proposed |
| bpm.button | action | event | — | — | — | — | proposed |
| bpm.theme | action | meta | — | — | — | — | proposed |
| bpm.selectbox | saisie | entity | — | — | — | — | proposed |
| bpm.numberInput | saisie | entity | — | — | — | — | proposed |
| bpm.input | saisie | entity | — | — | — | — | proposed |
| bpm.textarea | saisie | entity | — | — | — | — | proposed |
| bpm.checkbox | saisie | entity | — | — | — | — | proposed |
| bpm.radioGroup | saisie | entity | — | — | — | — | proposed |
| bpm.slider | saisie | entity | — | — | — | — | proposed |
| bpm.dateInput | saisie | entity | — | — | — | — | proposed |
| bpm.dateRangePicker | saisie | entity | — | — | — | — | proposed |
| bpm.timeInput | saisie | entity | — | — | — | — | proposed |
| bpm.rating | saisie | entity | — | — | — | — | proposed |
| bpm.fileUploader | saisie | entity | — | — | — | — | proposed |
| bpm.colorPicker | saisie | meta | — | — | — | — | proposed |
| bpm.chip | affichage | entity | — | — | — | — | proposed |
| bpm.message | feedback | event | — | — | — | — | proposed |
| bpm.spinner | feedback | section | — | — | — | — | proposed |
| bpm.loadingBar | feedback | section | — | — | — | — | proposed |
| bpm.tooltip | feedback | section | — | — | — | — | proposed |
| bpm.statusBox | indicateur | workflow | statut | neutre | instantane | contraste-avec → bpm.badge | proposed |
| bpm.breadcrumb | navigation | section | — | — | — | — | proposed |
| bpm.stepper | navigation | workflow | — | — | — | — | proposed |
| bpm.audio | affichage | entity | — | — | — | — | proposed |
| bpm.video | affichage | entity | — | — | — | — | proposed |
| bpm.html | affichage | section | — | — | — | — | proposed |
| bpm.lineChart | indicateur | kpi | tendance | contextuel | serie | contraste-avec → bpm.barChart; contraste-avec → bpm.areaChart | proposed |
| bpm.barChart | indicateur | kpi | distribution, compte | contextuel | instantane | contraste-avec → bpm.lineChart | proposed |
| bpm.areaChart | indicateur | kpi | tendance | contextuel | cumule | derive-de → bpm.lineChart | proposed |
| bpm.scatterChart | indicateur | kpi | distribution | neutre | instantane | contraste-avec → bpm.lineChart | proposed |
| bpm.modal | conteneur | section | — | — | — | — | proposed |
| bpm.codeBlock | affichage | section | — | — | — | — | proposed |
| bpm.topNav | navigation | section | — | — | — | — | proposed |
| bpm.fab | action | event | — | — | — | — | proposed |
| bpm.treeview | affichage | entity | — | — | — | — | proposed |
| bpm.timeline | affichage | event | — | — | — | — | **needs-curation** |
| bpm.flowDiagram | affichage | workflow | — | — | — | — | proposed |
| bpm.statusTracker | indicateur | workflow | progression, statut | borne-cible | instantane | derive-de → bpm.badge; contraste-avec → bpm.progress | proposed |
| bpm.activityFeed | affichage | event | — | — | — | — | **needs-curation** |
| bpm.orgChart | affichage | entity | — | — | — | — | **needs-curation** |
| bpm.masterDetail | conteneur | entity | — | — | — | — | proposed |
| bpm.wizardForm | saisie | entity | — | — | — | — | proposed |
| bpm.commandPalette | navigation | section | — | — | — | — | proposed |
| bpm.image | affichage | entity | — | — | — | — | proposed |
| bpm.pdfViewer | affichage | entity | — | — | — | — | proposed |
| bpm.autocomplete | saisie | entity | — | — | — | — | proposed |
| bpm.plotlyChart | indicateur | kpi | tendance, distribution, ratio | contextuel | contextuel | contraste-avec → bpm.metric | **needs-curation** |
| bpm.map | affichage | entity | — | — | — | — | proposed |
| bpm.altairChart | indicateur | kpi | tendance, distribution | contextuel | contextuel | — | proposed |
| bpm.barcode | affichage | connector | — | — | — | — | **needs-curation** |
| bpm.qrCode | affichage | connector | — | — | — | — | **needs-curation** |
| bpm.nfcBadge | affichage | connector | — | — | — | — | **needs-curation** |
| bpm.drawer | conteneur | section | — | — | — | — | proposed |
| bpm.pagination | navigation | entity | — | — | — | — | proposed |
| bpm.filterPanel | saisie | section | — | — | — | — | proposed |
| bpm.confirmModal | feedback | rule | — | — | — | — | proposed |
| bpm.toast | feedback | event | — | — | — | — | proposed |
| bpm.pageLayout | conteneur | section | — | — | — | — | proposed |
| bpm.scrollContainer | conteneur | section | — | — | — | — | proposed |
| bpm.labelValue | affichage | entity | — | — | — | — | proposed |
| bpm.spinnerDot | feedback | section | — | — | — | — | proposed |
| bpm.titleBpm | affichage | section | — | — | — | — | proposed |
| bpm.markdown | affichage | section | — | — | — | — | proposed |
| bpm.codeEditor | saisie | entity | — | — | — | — | proposed |
| bpm.crud | composite | entity | — | — | — | — | proposed |
| bpm.gps | saisie | entity | — | — | — | — | proposed |
| bpm.jsonEditor | saisie | entity | — | — | — | — | proposed |
| bpm.notificationCenter | affichage | event | — | — | — | — | proposed |
| bpm.filePreview | affichage | entity | — | — | — | — | proposed |
| bpm.dataExplorer | composite | entity | — | — | — | — | proposed |
| bpm.chatInterface | composite | ai | — | — | — | — | proposed |
| bpm.promptInput | saisie | ai | — | — | — | — | proposed |
| bpm.streamingText | affichage | ai | — | — | — | — | proposed |
| bpm.diffViewer | affichage | ai | — | — | — | — | **needs-curation** |
| bpm.modelSelector | saisie | ai | — | — | — | — | proposed |

## Légende

- **Rôle** : indicateur, affichage, saisie, action, conteneur, navigation, feedback, composite.
- **Frame Ω** : kpi, entity, workflow, rule, event, section, ai, connector, permission, meta.
- **Direction `contextuel`** : la polarité dépend du KPI affiché, pas du composant (ex. metric via deltaType).
- **Relations** : compose-dans / derive-de / contraste-avec — relations de SENS entre indicateurs,
  distinctes de l'imbrication de composants (associated/parent du registre).
