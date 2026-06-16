# Contrat — Endpoint galerie read-only (Maker → Modular)

> Entrée du prompt **D1-bis** : ce document spécifie l'endpoint à implémenter dans
> **blueprint-maker**. Il est consommé côté **blueprint-modular** par
> `lib/gallery/curated.ts` (proxy `GET /api/gallery`) et la page publique `/galerie`.

## Rôle

Exposer, en lecture seule, la liste des apps que l'utilisateur a **validées d'un
pouce vert** dans le Maker, afin de les afficher dans la galerie publique
« Apps créées avec Modular ». **Captures uniquement** — aucune app n'est exposée
en backend live à ce stade.

## Principe de séparation

- Le **filtrage « pouce vert » est fait CÔTÉ Maker**, jamais côté Modular.
  Modular fait confiance à l'endpoint : il n'a aucun moyen de re-vérifier la
  curation, donc l'endpoint **NE DOIT renvoyer QUE** des apps explicitement
  pouce vert (filtre strict — ni neutre, ni pouce rouge).
- Modular ne reçoit, ne valide et n'affiche que les **5 champs publics** ci-dessous.

## Requête

```
GET <MAKER_GALLERY_URL>
Accept: application/json
Authorization: Bearer <INTERNAL_API_SECRET>   # optionnel, si le Maker l'exige
```

- L'URL exacte est **configurable côté Modular** via la variable d'environnement
  `MAKER_GALLERY_URL` (jamais en dur). Recommandation : un chemin dédié et stable,
  ex. `http://localhost:<port_maker>/api/public/gallery`.
- Read-only : **GET uniquement**. Aucune mutation.

## Réponse — `200 OK`

`Content-Type: application/json`. Deux formes acceptées par le consommateur
(le sanitizer Modular gère les deux) ; **forme recommandée : l'enveloppe** :

```json
{
  "apps": [
    {
      "id": "ckxyz123",
      "title": "Suivi de production temps réel",
      "prompt": "Crée un tableau de bord qui suit le rendement de trois lignes…",
      "screenshotUrl": "https://cdn.exemple/captures/ckxyz123.png",
      "createdAt": "2026-05-28T09:12:00.000Z"
    }
  ]
}
```

Un tableau nu `[ { … } ]` est également accepté.

### Champs (tous publics, strictement ces 5)

| Champ          | Type             | Notes |
|----------------|------------------|-------|
| `id`           | `string`         | Identifiant stable de l'app. **Requis.** |
| `title`        | `string`         | Titre affiché. **Requis** (item ignoré si vide). |
| `prompt`       | `string`         | Prompt d'origine. Peut être vide. |
| `screenshotUrl`| `string \| null` | URL d'une capture (image, ou poster d'une courte vidéo). `null` si aucune capture. **Pas d'URL de backend live.** |
| `createdAt`    | `string`         | Date ISO 8601. |

### Interdits (ne JAMAIS inclure)

- `code`, `schema`, `previewUrl`, ni aucune URL pointant vers un backend live.
- Données d'organisation, d'utilisateur, ou tout champ sensible.
- Toute app non explicitement pouce vert.

## Erreurs & robustesse

- Modular applique un **fallback propre** : endpoint absent, injoignable, non-2xx
  ou JSON invalide ⇒ **galerie vide** (aucune erreur 500 propagée à l'utilisateur).
- L'endpoint Maker devrait répondre `200` avec `{ "apps": [] }` quand aucune app
  n'est pouce vert (et non une 404).

## Capture / screenshot (note pour D1-bis)

Si le Maker (K-15 / Playwright) capture déjà un screenshot exploitable, **réutiliser**
son URL telle quelle dans `screenshotUrl`. Sinon, prévoir une **capture asynchrone
non bloquante** (ne doit jamais ralentir la génération) qui renseigne `screenshotUrl`
a posteriori ; tant qu'elle n'existe pas, renvoyer `screenshotUrl: null` (la galerie
affiche alors un état « aperçu indisponible »). Côté Modular : **rien à faire** hormis
afficher l'URL fournie.

## Variables d'environnement (Modular)

| Variable             | Rôle |
|----------------------|------|
| `MAKER_GALLERY_URL`  | URL de l'endpoint Maker. Absente ⇒ galerie vide. |
| `INTERNAL_API_SECRET`| Bearer interne partagé (optionnel), si le Maker protège l'endpoint. |
| `GALLERY_USE_FIXTURE`| `1` ⇒ sert la fixture locale (`lib/gallery/fixture.ts`) pour dev/CI. Jamais en prod. |
