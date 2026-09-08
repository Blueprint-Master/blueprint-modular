# Reusable objects

`@blueprint-modular/core/objects` exports `ModularObject`, `PlanetObject`, a versioned catalogue and a strict `.modular.json` parser. Existing 1.0.0 vector objects remain unchanged. Universe 2.0.0 adds eight planets, Sun, Moon and eight additional moons in photorealistic and illustration styles.

```tsx
import { ModularObject } from '@blueprint-modular/core/objects';
<ModularObject id="saturn" version="2.0.0" variant="illustration"
  locale="fr" size={360} playing speed={1} interactive />
```

Build core, then copy `packages/core/dist/assets/objects` into the consuming application's `public/objects`, or set `assetBaseUrl` to the deployed `universe-v2` directory. Credits ship with the assets. An already installed 0.3.14 package does not gain this code automatically; npm publication is a separate release action.

## Motion and interaction

The texture rotates over the sphere under fixed lighting. Clouds rotate independently; Saturn's rings use depth ordering and shadowing. Drag and arrow keys turn the globe. Props: `playing`, `speed` (0.1–3), `angle`, `size`, `variant`, `interactive`, `assetBaseUrl`, `thumbnail`. Version 2 does not apply the vector-only `color` tint. These are artistic presentation rotations, not scientifically timed orbital simulations.

WebGL is preferred: at most 512 backing pixels / 24 fps, or 320 / 18 on coarse-pointer, narrow or data-saving devices. Software fallback is bounded to 288 / 12, or 224 / 12 on constrained devices. These are ceilings, not guaranteed performance. One timer drives each active object; there is no idle RAF polling. Projection and illumination are cached. Texture loading starts only when the object enters view. Compact WebP maps are at most 1024 pixels wide, posters 256. The npm asset directory ships runtime derivatives and credits; original JPG maps and legacy PNG posters remain in the source repository, outside the package. Reduced-motion preferences, hidden documents and offscreen objects stop automatic rotation. Catalogue thumbnails load lazily without allocating animated canvases. Texture failures show an explicit static-preview state.

At the repository root, `node scripts/generate-object-previews.cjs` regenerates all 36 transparent WebP posters from the actual software renderer. `npm run dev -- --strictPort --port 4173` runs the isolated source-level visual harness; `/preview-objects.html?catalogue` shows the catalogue with a locale adapter. This harness has no authenticated API/database. Ordinary `npm run dev` starts Next.js.

## Provenance and quality

Photorealistic maps, clouds and rings: [Solar System Scope / INOVE](https://www.solarsystemscope.com/textures/), CC BY 4.0. `public/objects/universe-v2/manifest.json` records the fixed source-mirror commit, filenames and SHA-256. Painted surfaces are original AI-generated artwork; prompts and hashes appear in `illustration-manifest.json`. Clouds/rings retain Solar System Scope attribution in both styles. Keep `ATTRIBUTION.txt` on redistribution. Imagery includes artistic reconstruction; it is not a set of telescope photographs.

Eight source-textured moons are grouped by parent: Io, Europa, Ganymede, Callisto (Jupiter); Titan, Enceladus (Saturn); Titania (Uranus); Triton (Neptune). `moon-manifest.json` records the pinned NASA/Celestia paths, hashes and per-map licenses. NASA media terms are distinct from CC BY; keep the supplied credits and do not imply endorsement. Their illustration variant uses procedural drawn shading over the source map, not a separately painted texture. `DISCOVERABLE_OBJECTS` includes 28 selectable objects; `MODULAR_OBJECTS` preserves the immutable 20 v1 definitions. New moons resolve only at version 2.0.0.

Earth cloud drift, latitude-dependent gas/cloud-envelope flow and subtle solar luminosity evolve independently of the rotation transform. Airless terrain stays rigid. `playing={false}` and reduced motion freeze the whole scene. These are subtle artistic movements, not a weather simulation; plumes, eruptions and tornadoes are outside this pass.

Regenerate compact textures with `node scripts/build-compact-universe.cjs /absolute/moon-sources` (original moon JPEGs named by ID, SHA-256 checked against the manifest), then `node scripts/generate-object-previews.cjs`. Benchmark the software path with `node scripts/benchmark-universe.cjs`.

The catalogue also links to Poly Haven, ambientCG and Kenney. Their asset licenses are separate from site/API access terms; this implementation does not scrape them. The initial import uses Solar System Scope. Community uploads support PNG, JPEG and WebP images or 2:1 planet textures, not GLB models or executable components.

Review candidates at thumbnail and full size: distinctive silhouette, surface detail, coherent light, clean transparency/seams, convincing motion and a deliberately different painted treatment. Reject blurred enlargements, broken poles or seams, generic gradients, misleading source claims and missing redistribution rights.

## Community and release

The catalogue groups built-ins by theme and offers public contributions and submissions. A real signed-in user can submit; OWNER/ADMIN users can publish or reject pending objects from “Mes propositions”. Pending/rejected images are private to authors and reviewers. Published bytes/hashes are immutable. Uploads are bounded to 10 MB and 16 megapixels, decoded and re-encoded to WebP without metadata. Planet textures require a 2:1 ratio. No SVG or executable uploads.

Before release, apply `20260908150000_object_contributions` and configure `OBJECT_UPLOAD_DIR` on persistent storage (default `uploads/objects`). Back it up together with the database. The migration has not been applied in this implementation session. Validate real authentication, uploads and moderation before enabling contributions.

“Ajouter à Maker” downloads a data-only reference. The companion Maker change accepts it in chat or in its picker, pins identity/version/style/animation in `AppSpec.meta.modularObjects`, and packages the renderer, selected assets and credits. Community references also pin SHA-256. Unknown versions or changed bytes fail explicitly. The other ten built-in vector objects also export to Maker, with their exact version 1 rendering included as PNG; regenerate these with `node scripts/generate-vector-object-previews.mjs` after building core. Up to five composer attachments are supported. Generated applications place a selectable object collection within their existing shell; arbitrary per-page drag-and-drop placement is not implemented.

Core/Modular builds and TypeScript checks pass locally. The software renderer is visually checked in the supervised browser; accelerated WebGL needs a GPU-enabled browser check. Maker's focused tests cover exact references and packaging across nine shell/theme combinations. Full Maker build/CI and an authenticated chat-to-deployment run remain release gates. Do not self-merge or claim deployment from source changes.

Titania and Triton: initial NASA maps with large black unmapped regions were rejected during visual review. Their replacement maps come from CelestiaContent and retain CC BY-SA 4.0 (Titania) / CC BY 3.0 (Triton), including the compact textures and both derived posters. Full authors, source links and changes ship in ATTRIBUTION.txt and moon-manifest.json. Unobserved regions remain neutral rather than invented terrain.
