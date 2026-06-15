// Marque Blueprint Modular embarquée en data URI (PNG 64×64, transparent).
//
// Pourquoi inliner plutôt que `<img src="/img/icon-pwa-192.png">` ?
// La marque doit s'afficher partout (nav vitrine, barre de titre, sidebar) sans
// jamais dépendre d'un fichier statique servi séparément. Un asset sous public/
// peut manquer côté serveur (build standalone qui n'a pas recopié public/, cache
// CDN, déploiement partiel) et laisser une image cassée à la place du logo —
// « on a perdu le logo ». Embarquée dans le bundle, la marque ne peut pas tomber
// en 404 : elle suit le code. Les favicons (app/layout.tsx, app/manifest.ts)
// restent eux des fichiers réels — un <link rel="icon"> ne peut pas être inliné.
export const BRAND_MARK_SRC =
  "data:image/png;base64,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";
