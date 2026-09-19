# Drapeaux — candidat 2026-09-18

`flag-banner@1.0.0` est un objet paramétrable, pas 311 copies du moteur.
311 motifs : pays et territoires distingués des 50 États américains, plus UE.
Le catalogue n'est **pas exhaustif** : Afghanistan, ONU, OTAN et organisations
supplémentaires restent reportés (voir `manifest.json.excluded`). Les territoires
ne constituent pas une liste de pays reconnus. Inventaire source daté de 2024,
avec mises à jour documentées pour Syrie, Minnesota et Utah ; revue exhaustive
des évolutions géopolitiques encore requise avant promotion.

Deux rendus (`photorealistic`, `illustration`) partagent un motif exact.
Le premier est un shader de tissu synthétique, **pas une photographie** ; son
niveau de réalisme n'a pas encore été validé visuellement. Modes à plat et flottant,
avec pause, vitesse, vent, fonds transparent/nuit/papier. Calques : motif,
tissage/coutures, éclairage, mât. `FlagArtworkLayer` expose un groupe SVG composable.

## Provenance et reproduction

`public/objects/flags-v1/manifest.json` contient, pour chaque motif, auteur, URL
source épinglée, licence, preuve de licence, empreinte originale et dérivée.
Les licences individuelles restent applicables aux dérivés. `SOURCE-LICENSE.txt`
est la notice amont, non une permission globale ajoutée. L'emblème européen ne
signifie aucune affiliation. Les sources sont des tracés existants, sans image IA.

`node scripts/generate-flags.mjs <dossier-des-svg-originaux>` vérifie les empreintes,
produit un WebP sans perte, limité à 768 px, dans une enveloppe SVG autonome, puis
régénère le catalogue. Sans argument : vérification des dérivés et régénération
seulement. Les originaux sont récupérables aux URL épinglées du manifeste.

## Budgets et validation

Mesures sur les fichiers reconstruits le 2026-09-18 : 311 motifs, 5 593 054 octets
bruts au total ; un motif de 246 à 185 406 octets, médiane 7 030. Ce sont des tailles
de fichiers, **pas un poids réseau mesuré**. Une image sélectionnée est chargée à
la demande ; les vignettes restent fixes. Résolution du canvas plafonnée à
384 px / 18 fps sur appareil contraint, 640 px / 24 fps sinon ; maillage de
1 625 sommets, 3 072 triangles. Une horloge par objet actif, aucune pour les
vignettes ; la vitrine n'anime que sa sélection. Pause, onglet masqué, hors écran,
vent nul et reduced-motion arrêtent l'horloge. Boucle de présentation de 12 s,
hampe ancrée, déformation locale du bord libre ; pas une simulation textile.

Le navigateur a refusé l'aperçu local avec `ERR_BLOCKED_BY_CLIENT`. **Qualité
visuelle animée non validée**. Rendus des deux styles, tailles, fonds,
transparence, raccord, interactions DOM/WebGL et pause doivent être inspectés
réellement. Aucun coût GPU, réseau mobile, téléphone physique ou batterie mesuré.
Tests mathématiques/SSR et vérification des empreintes ne remplacent pas cette revue.

Le candidat est absent de `DISCOVERABLE_OBJECTS`. L'onglet Drapeaux donne accès
explicitement à son aperçu. Aucun statut « terminé », fusionné, publié npm ou
disponible en production n'est revendiqué. Adaptateur Maker à lier dans une PR privée.

## Aperçu reproductible

Depuis la racine : `npx vite --host 127.0.0.1 --port 4173`, puis
`http://127.0.0.1:4173/docs/previews/flags/`. Cette page monte le véritable composant
avec choix du motif, style, taille, calques, fond, vent et pause. Il ne s'agit pas
d'une preuve animée inspectée. Référence portable : `examples/objects/flag-fr.modular.json`.

## Correctif du 19 septembre 2026

La compilation GLSL ES 1.00 échouait : `flat` est réservé. Renommage en
`flatMode`, plis diagonaux et déformation du bord libre, éclairage continu avec
ourlets pour le tissu ; contours, ombres en aplats et hachures pour le dessin.
La légende du catalogue distingue désormais les deux rendus.

`python scripts/verify-flag-shaders.py` compile les véritables shaders et vérifie
rendu non figé, différence de styles, alpha, immobilité à plat et raccord de
boucle (tolérance moyenne < 0,1/255 pour l’arrondi flottant). Exécuté avec
Mesa llvmpipe LLVM 20.1.2, EGL Linux, rendu logiciel. Les planches à 0, 2 et 4 s
ont été inspectées ; une preuve de 48 images couvre les 12 secondes.
[Aperçu comparatif](previews/flags/render-check/comparison.webp) ·
[Animation du shader](previews/flags/render-check/cloth.webp).

Ce contrôle est désormais dans la CI. Il ne monte pas React et ne valide ni
l’import dynamique du navigateur, ni le chargement de texture par Image, ni
pause/hors écran/reduced-motion dans le DOM. Aucun coût GPU ou téléphone mesuré.
L’aspect obtenu est un tissu synthétique amélioré ; le niveau photoréaliste
reste à valider, et le candidat reste exclu de la découverte générale.
