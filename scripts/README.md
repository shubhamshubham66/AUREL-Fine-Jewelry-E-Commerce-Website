# AUREL build scripts

## `generate-jewelry-models.mjs`

Procedurally generates all 10 product `.glb` files (and the matching SVG
hero thumbnails) directly from the catalogue in `src/data/products.js`.

Run it whenever you change product metadata, swap a category, or want
to refresh the geometry:

```bash
npm run models
# or directly:
node scripts/generate-jewelry-models.mjs
```

This writes:

- `public/models/*.glb` — the meshes loaded by `JewelryViewer3D`
- `public/products/<category>/<slug>.svg` — hero / angle / detail thumbnails
- `public/products/<category>/<slug>.svg` — also re-derived for `CATEGORIES`

### What you get

Each `.glb` contains a single named root group made of multiple meshes,
each with a material whose `name` follows AUREL's convention so the
viewer's PBR override pipeline applies the right shader at runtime:

| Material name pattern             | Viewer applies                         |
| --------------------------------- | -------------------------------------- |
| `*_metal` (gold / rose / white …) | High-metalness PBR with sheen          |
| `diamond_stone`, `*_stone`, etc.  | Glassy MeshPhysicalMaterial, IOR 2.41  |
| `pearl`                            | Sheen-rich pearl                       |
| `black_onyx`                       | Dark gem with clearcoat                |

### Geometry summary

- **Diamonds** are real round-brilliant cuts: 16-segment table → crown →
  girdle → pavilion → culet (flat-shaded for visible facets).
- **Rings** have a cathedral 4-prong setting, optional pavé halo, and
  shoulder pavé. Band has a subtle D-profile.
- **Necklaces** are tube-along-curve chains with a bail + bezel-set
  pendant or a graduated pearl strand for pearl pieces.
- **Earrings** include a French hook + drop-bezel + stone, or a stud
  with a 4-prong setting.
- **Bracelets** are tennis-style linked bezels OR cuff bangles with
  milgrain edges and three accent stones.
- **Chains** combine a smooth tube with overlaid oval rope-link detail.

### Don't touch

The viewer (`src/components/JewelryViewer3D.jsx`) intentionally
overrides materials by mesh / material name. If you rename meshes in
the script, also update the matching cases in the viewer.
