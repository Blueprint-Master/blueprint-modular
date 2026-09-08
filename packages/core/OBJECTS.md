# Reusable objects

`@blueprint-modular/core/objects` exports `ModularObject`, `PlanetObject`, a versioned catalogue and a strict `.modular.json` parser. Existing 1.0.0 vector objects remain unchanged. Universe 2.0.0 adds eight planets, Sun and Moon in photorealistic and painted styles.

```tsx
import { ModularObject } from '@blueprint-modular/core/objects';
<ModularObject id="saturn" version="2.0.0" variant="illustration"
  locale="fr" size={360} playing speed={1} interactive />
```

Build core, then copy `packages/core/dist/assets/objects` into the consuming application's `public/objects`, or set `assetBaseUrl` to the deployed `universe-v2` directory. Credits ship with the assets. An already installed 0.3.14 package does not gain this code automatically; npm publication is a separate release action.

## Motion and interaction

The texture rotates over the sphere under fixed lighting. Clouds rotate independently; Saturn's rings use depth ordering and shadowing. Drag and arrow keys turn the globe. Props: `playing`, `speed` (0.1–3), `angle`, `size`, `variant`, `interactive`, `assetBaseUrl`, `thumbnail`. Version 2 does not apply the vector-only `color` tint. These are artistic presentation rotations, not scientifically timed orbital simulations.

WebGL is preferred, with an animated software canvas sphere fallback bounded to 384 px and 20 fps. Reduced-motion preferences, hidden documents and offscreen objects stop automatic rotation. Catalogue thumbnails load lazily without allocating animated canvases. Texture failures show an explicit static-preview state.

At the repository root, `node scripts/generate-object-previews.cjs` regenerates all 20 transparent posters from the actual software renderer. `npm run dev -- --strictPort --port 4173` runs the isolated source-level visual harness; `/preview-objects.html?catalogue` shows the catalogue with a locale adapter. This harness has no authenticated API/database. Ordinary `npm run dev` starts Next.js.

## Provenance and quality

Photorealistic maps, clouds and rings: [Solar System Scope / INOVE](https://www.solarsystemscope.com/textures/), CC BY 4.0. `public/objects/universe-v2/manifest.json` records the fixed source-mirror commit, filenames and SHA-256. Painted surfaces are original AI-generated artwork; prompts and hashes appear in `illustration-manifest.json`. Clouds/rings retain Solar System Scope attribution in both styles. Keep `ATTRIBUTION.txt` on redistribution. Imagery includes artistic reconstruction; it is not a set of telescope photographs.

The catalogue also links to Poly Haven, ambientCG and Kenney. Their asset licenses are separate from site/API access terms; this implementation does not scrape them. The initial import uses Solar System Scope. Community uploads support PNG, JPEG and WebP images or 2:1 planet textures, not GLB models or executable components.

Review candidates at thumbnail and full size: distinctive silhouette, surface detail, coherent light, clean transparency/seams, convincing motion and a deliberately different painted treatment. Reject blurred enlargements, broken poles or seams, generic gradients, misleading source claims and missing redistribution rights.

## Community and release

The catalogue groups built-ins by theme and offers public contributions and submissions. A real signed-in user can submit; OWNER/ADMIN users can publish or reject pending objects from “Mes propositions”. Pending/rejected images are private to authors and reviewers. Published bytes/hashes are immutable. Uploads are bounded to 10 MB and 16 megapixels, decoded and re-encoded to WebP without metadata. Planet textures require a 2:1 ratio. No SVG or executable uploads.

Before release, apply `20260908150000_object_contributions` and configure `OBJECT_UPLOAD_DIR` on persistent storage (default `uploads/objects`). Back it up together with the database. The migration has not been applied in this implementation session. Validate real authentication, uploads and moderation before enabling contributions.

“Ajouter à Maker” downloads a data-only reference. The companion Maker change accepts it in chat or in its picker, pins identity/version/style/animation in `AppSpec.meta.modularObjects`, and packages the renderer, selected assets and credits. Community references also pin SHA-256. Unknown versions or changed bytes fail explicitly. The other ten built-in vector objects also export to Maker, with their exact version 1 rendering included as PNG; regenerate these with `node scripts/generate-vector-object-previews.mjs` after building core. Up to five composer attachments are supported. Generated applications place a selectable object collection within their existing shell; arbitrary per-page drag-and-drop placement is not implemented.

Core/Modular builds and TypeScript checks pass locally. The software renderer is visually checked in the supervised browser; accelerated WebGL needs a GPU-enabled browser check. Maker's focused tests cover exact references and packaging across nine shell/theme combinations. Full Maker build/CI and an authenticated chat-to-deployment run remain release gates. Do not self-merge or claim deployment from source changes.
