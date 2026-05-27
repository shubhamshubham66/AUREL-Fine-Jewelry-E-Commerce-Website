# 3D Models (.glb)

Drop your `.glb` jewelry models into this folder. The 3D viewer
(`src/components/ui/JewelryViewer3D.jsx`) will automatically load them.

## How it works

Each product in `src/data/products.js` has an optional `model` field:

```js
{ id: 'aur-001', name: 'Eternal Solitaire', model: 'ring.glb', ... }
```

When the product modal opens, `JewelryViewer3D`:

1. Tries to load `/public/models/<model>.glb` via Three.js `GLTFLoader`.
2. If the file is missing or fails to load, it **gracefully falls back**
   to a procedural Three.js model (real 3D geometry — torus + diamond cone
   for rings, drop shape for earrings, etc.).
3. So the page never blanks out, even if you haven't added .glb files yet.

## Recommended model files

| File              | For category | Notes                                 |
|-------------------|-------------|---------------------------------------|
| `ring.glb`        | Rings       | Single solitaire ring                 |
| `necklace.glb`    | Necklaces   | Pendant on chain                      |
| `earring.glb`     | Earrings    | Drop / stud earring                   |
| `bracelet.glb`    | Bracelets   | Tennis bracelet / cuff                |

Or use product-specific filenames (e.g. `eternal-solitaire.glb`) and
reference them per-product in `products.js`.

## Specifications
- **Format:** glTF 2.0 binary (`.glb`)
- **Size:** Keep each file under **2 MB** for fast page loads
- **Origin:** Centered around (0, 0, 0)
- **Scale:** Approximately 1 unit = 1 inch (the viewer auto-fits)
- **Materials:** PBR materials work best (metalness/roughness)

## Where to get free .glb models

- [Sketchfab](https://sketchfab.com/) — search "ring", filter by "downloadable"
- [Khronos glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models)
- [Poly Pizza](https://poly.pizza/)

## Optimizing models

Use [gltf-transform](https://gltf-transform.dev/) to compress and optimize:

```bash
npx @gltf-transform/cli optimize input.glb output.glb
```

This typically reduces file size by 50-80% with no visible quality loss.
