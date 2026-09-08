# Reusable objects

The `@blueprint-modular/core/objects` entry exports `ModularObject`, a lightweight React renderer, and a versioned data-only catalogue. The `/objets` section uses this exact renderer, not a separate mock preview. Core must be built and published with this entry before consumers can use it; an existing installed 0.3.14 package does not gain this entry automatically.

```tsx
import { ModularObject } from '@blueprint-modular/core/objects';
<ModularObject id="saturn" version="1.0.0" locale="fr" size={280} angle={12} />
```

Twenty standard objects: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Sun, Moon, house, building, warehouse, factory, car, van, truck, pallet, parcel and container. They are **stylized vector illustrations**, not CAD, astronomical ephemerides, physical simulations or photorealistic 3D assets. The controls change illustrative projection/tilt and size, not a physical camera. No scientific accuracy is claimed.

## Stable contract

- `resolveModularObject(id, version)` resolves exact IDs and versions. Unknown values return undefined; the renderer displays a visible unavailable state. No semantic lookalike is substituted.
- `searchModularObjects(query, family)` performs deterministic accent-insensitive bilingual discovery.
- `MODULAR_OBJECTS` is frozen, contains provenance/license/fidelity, and has no tenant/user content.
- Optional `color` accepts six-digit hex only; no external paint URLs. Size and angle are finite and bounded. Labels are escaped by React.
- No runtime downloads, dependencies beyond the existing React/Modular stack, timers, WebGL, or global styles in the renderer. It is SSR-safe; illustration IDs use React useId.
- Preserve version 1.0.0 definitions. Breaking visual/data changes require a new object version, not silent replacement.

## Product and integration boundaries

Craft should select validated objects and bounded variants; Masterpiece may create a new candidate upstream, subject to the same acceptance gates. Neither may replace the chosen navigation or silently omit an essential object. Promotion into this catalogue requires source/license review, renderer coverage, exports, tests and an actual consumer in the same change.

This PR wires catalogue → exact resolver → renderer → `/objets` UI → public package entry. It does **not** claim Maker has integrated the new entry, that npm publication has occurred, or that the site is deployed. Those are separate release and end-to-end acceptance steps. No paid API calls are made by this catalogue.
