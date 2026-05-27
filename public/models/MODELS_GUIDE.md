# Swapping in Real Jewelry GLB Models

The viewer renders whatever `model3D` URL is set on each product. The
default is the procedural `.glb` files in this folder, but you can
point any product at a real photogrammetry-quality model that you own
or have licensed — no code changes required.

## How the viewer resolves a model

Every product entry in `src/data/products.js` has a `model3D` field:

```js
model3D: '/models/ring.glb',
```

`JewelryViewer3D.jsx` resolves this through the `asset()` helper, so:

| Value                                     | Resolves to                                                       |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `'/models/ring.glb'`                      | `<base>/models/ring.glb` (this folder, served from /public)       |
| `'models/ring.glb'`                       | Same as above — leading slash is optional                         |
| `'https://cdn.example.com/ring.glb'`      | Used verbatim — external CDNs work out of the box                 |
| `'data:model/gltf-binary;base64,...'`     | Used verbatim — inline data URLs work too                         |

## Where to get real GLB models

| Source | License | Notes |
| ------ | ------- | ----- |
| [Sketchfab](https://sketchfab.com/) | Various | Filter by **CC0 / CC-BY**, "downloadable", and search "ring" / "necklace" / "earring" |
| [Khronos Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models) | CC-BY / Apache | Mostly generic but useful as test data |
| [Poly Pizza](https://poly.pizza/) | CC-BY | Many free low-poly assets |
| [Polycam](https://poly.cam/explore) | Various | Real-world scans, check license per model |
| Your manufacturer | Bespoke | Most jewelers have CAD files (`.stl`/`.obj`/`.fbx`) — convert with `gltf-pipeline` |

## Optimising downloaded models

Big GLBs slow the viewer down. Always run new models through
[gltf-transform](https://gltf-transform.dev/) first:

```bash
# Compress geometry + textures, weld duplicate vertices, drop unused data
npx @gltf-transform/cli optimize input.glb output.glb

# Aggressive — Draco-compress geometry on top
npx @gltf-transform/cli draco output.glb output.glb
```

Aim for under **500 KB per model**. Most real jewelry models compress
to **150–300 KB** without visible quality loss.

## Replacing a model

1. Optimise the new GLB (above).
2. Drop it into `public/models/` — e.g. `engagement-ring.glb`.
3. Edit `src/data/products.js`:

   ```js
   model3D: '/models/engagement-ring.glb',
   ```

4. Commit and push. The viewer will pick it up on next build — no code
   changes needed in `JewelryViewer3D.jsx`.

## Material naming convention (optional but powerful)

`JewelryViewer3D.jsx` overrides materials by mesh / material name so
the same GLB looks correct under any chosen metal swatch. If you build
your own GLB, name the meshes / materials so they match these patterns:

| Material name contains          | Viewer applies                                |
| ------------------------------- | --------------------------------------------- |
| `metal`, `gold`, `silver`, etc. | High-metalness PBR with sheen, swatch-tinted  |
| `diamond`, `stone`, `gem`       | Glassy MeshPhysicalMaterial (transmission, IOR 2.41) |
| `pearl`                         | Sheen-rich pearl                              |
| `onyx`, `black`                 | Dark gem with clearcoat                       |

Anything that doesn't match falls back to the metal shader, so untagged
GLBs still render as gold by default.

## Procedural fallback

If you prefer the procedural meshes (no real GLB needed), keep the
default `model3D: '/models/<slug>.glb'` paths and run:

```bash
npm run models
```

This regenerates every `.glb` from `scripts/generate-jewelry-models.mjs`
using Three.js primitives. The latest version produces:

- Round-brilliant cut diamonds with 32-facet topology and Tolkowsky
  ideal proportions (table 56%, crown 15.5%, pavilion 43.5%).
- Cathedral 4-prong claw settings with rounded prong tips.
- Bezel-set pavé halos around solitaires.
- Tube-along-curve necklace chains with proper bails.
- French-hook drop earrings + 4-prong studs.
- Tennis-bracelet bezel chains and milgrain cuff bangles.

Not photogrammetry-grade but a solid placeholder while you source real
scans.
