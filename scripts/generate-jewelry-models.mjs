/**
 * AUREL — realistic jewellery model generator.
 *
 *   node scripts/generate-jewelry-models.mjs
 *
 * Replaces every product's .glb in /public/models with a high-detail
 * procedural mesh. Each mesh keeps the SAME material naming convention
 * the viewer expects (`*_metal`, `*_stone`, `pearl`, `black_onyx`),
 * so JewelryViewer3D's PBR material override pipeline still applies
 * gold / diamond / pearl / dark-gem materials at runtime.
 *
 * Geometry upgrades vs. previous version:
 *   - Proper round-brilliant cut diamonds (table + 16-facet crown +
 *     girdle band + faceted pavilion + culet) instead of an octahedron.
 *   - Cathedral 4-prong claw settings holding the centre stone.
 *   - Bezel-set pavé halos around solitaires.
 *   - Tennis-style oval-bezel link bracelets / chains.
 *   - Pendant bails connected to chain via tube-along-curve.
 *   - Drop earrings with hook + post + bezel-set drops.
 *   - Cuff bangles with milgrain edge detail and accent stones.
 *
 * The script also re-exports the matching SVG hero / angle / detail
 * thumbnails so the catalogue stays consistent.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PRODUCTS, CATEGORIES } from '../src/data/products.js';

// GLTFExporter relies on FileReader from the browser; provide a tiny shim.
globalThis.FileReader = class FileReader {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};

const root = path.resolve('.');
const exporter = new GLTFExporter();

/* ─────────────────────────────────────────────
   COLOURS — the viewer overrides materials by
   name pattern, so these are mostly cosmetic for
   anyone opening the .glb in a 3D editor.
───────────────────────────────────────────── */
const palette = {
  yellow: '#D4AF37',
  rose: '#B76E79',
  white: '#D8DDE2',
  silver: '#C9D0D8',
  platinum: '#E4E7EA',
  diamond: '#F8FCFF',
  pearl: '#F7EFE4',
  ruby: '#9B1028',
  emerald: '#087B55',
  sapphire: '#174A8B',
  black: '#070707',
};

/* ─────────────────────────────────────────────
   PRODUCT METADATA HELPERS
───────────────────────────────────────────── */
function hash(value) {
  return [...String(value)].reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0,
    7,
  );
}

function metalKey(product) {
  const text = `${product.material} ${product.gemstone}`.toLowerCase();
  if (text.includes('rose')) return 'rose';
  if (text.includes('white')) return 'white';
  if (text.includes('platinum')) return 'platinum';
  if (text.includes('silver')) return 'silver';
  return 'yellow';
}

function gemKey(product) {
  const text =
    `${product.gemstone} ${(product.tags || []).join(' ')}`.toLowerCase();
  if (text.includes('ruby')) return 'ruby';
  if (text.includes('emerald')) return 'emerald';
  if (text.includes('sapphire')) return 'sapphire';
  if (text.includes('pearl')) return 'pearl';
  if (text.includes('onyx') || text.includes('black')) return 'black';
  return 'diamond';
}

function makeMaterial(color, name, metalness = 1, roughness = 0.12) {
  return new THREE.MeshStandardMaterial({ name, color, metalness, roughness });
}

function createMaterials(product) {
  const metal = metalKey(product);
  const gem = gemKey(product);
  const isPearl = gem === 'pearl';
  const isBlack = gem === 'black';
  return {
    metal: makeMaterial(palette[metal], `polished_${metal}_metal`, 1, 0.1),
    gem: makeMaterial(
      palette[gem],
      isPearl
        ? 'pearl'
        : isBlack
          ? 'black_onyx'
          : `${gem}_stone`,
      isPearl ? 0 : isBlack ? 0.18 : 0.05,
      isPearl ? 0.16 : isBlack ? 0.08 : 0.02,
    ),
    diamond: makeMaterial(palette.diamond, 'diamond_stone', 0, 0.02),
    dark: makeMaterial(palette.black, 'black_onyx', 0.18, 0.08),
  };
}

/* ─────────────────────────────────────────────
   MESH HELPERS
───────────────────────────────────────────── */
function meshNode(geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], name = 'mesh') {
  const node = new THREE.Mesh(geometry, mat);
  node.name = name;
  node.position.set(...position);
  node.rotation.set(...rotation);
  node.scale.set(...scale);
  node.castShadow = true;
  node.receiveShadow = true;
  return node;
}

/* ─────────────────────────────────────────────
   ROUND BRILLIANT CUT DIAMOND
   Topology approximates the GIA "ideal" round brilliant cut:
     - Table:    32-side polygon at the top
     - Crown:    32 trapezoidal facets (cone frustum, ~34.5° angle)
     - Girdle:   thin 32-side cylinder (highlight band, ~3% of diameter)
     - Pavilion: 32 trapezoidal facets converging to a tiny culet flat
                 (~4% of girdle radius — never a sharp point on a real
                 diamond) at the bottom (~40.75° angle)
   Default proportions follow the Tolkowsky ideal ratios:
     table = 56% of girdle diameter, crown = 16%, pavilion depth = 43%.
   Total ≈ 192 faceted triangles per stone — flat-shaded so every
   facet catches the HDR studio light separately, like the real thing.
───────────────────────────────────────────── */
function brilliantDiamondGeometry({
  // ── Modern API: specify a girdle radius and the proportions
  //    flow from there. This gives every stone the same correct
  //    shape regardless of size.
  girdleRadius = 0.5,
  tableRatio = 0.56,        // Tolkowsky ideal: 53-58%
  crownRatio = 0.155,       // crown height ≈ 15.5% of girdle diameter
  girdleRatio = 0.03,       // girdle thickness ≈ 3% of girdle diameter
  pavilionRatio = 0.435,    // pavilion depth ≈ 43.5% of girdle diameter
  culetRatio = 0.045,       // culet flat ≈ 4.5% of girdle radius
  segments = 32,
  // ── Legacy API: explicit values still win, so older call-sites
  //    keep their stylised proportions. We just bump segments.
  tableRadius,
  crownHeight,
  girdleHeight,
  pavilionHeight,
} = {}) {
  const diameter = girdleRadius * 2;
  const tableR = tableRadius !== undefined ? tableRadius : girdleRadius * tableRatio;
  const crownH = crownHeight !== undefined ? crownHeight : diameter * crownRatio;
  const girdleH = girdleHeight !== undefined ? girdleHeight : diameter * girdleRatio;
  const pavilionH = pavilionHeight !== undefined ? pavilionHeight : diameter * pavilionRatio;
  const culetR = girdleRadius * culetRatio;

  // Crown: truncated cone with the table closed on top.
  const crown = new THREE.CylinderGeometry(
    tableR,
    girdleRadius,
    crownH,
    segments,
    1,
    false, // closed → table cap visible on top
  );
  crown.translate(0, girdleH / 2 + crownH / 2, 0);

  // Girdle: thin open cylinder forming a highlight band where the crown
  // meets the pavilion. No caps — they would z-fight with the cones.
  const girdle = new THREE.CylinderGeometry(
    girdleRadius,
    girdleRadius,
    girdleH,
    segments,
    1,
    true,
  );

  // Pavilion: truncated cone tapering to a tiny culet flat (not a needle
  // point). A real-world brilliant cut never terminates as a perfect
  // point because that fragile tip would chip off — so neither does ours.
  const pavilion = new THREE.CylinderGeometry(
    girdleRadius,
    culetR,
    pavilionH,
    segments,
    1,
    false, // closed → tiny culet visible at the bottom
  );
  pavilion.translate(0, -girdleH / 2 - pavilionH / 2, 0);

  // Merge and *flat-shade* so each facet reflects light independently —
  // this is what makes the diamond look faceted rather than smooth.
  const merged = mergeGeometries([crown, girdle, pavilion], false);
  const flat = merged.toNonIndexed();
  flat.computeVertexNormals();
  return flat;
}

/**
 * Quick faceted brilliant for accent stones in pavé halos / channel sets.
 * Bumped to 12 segments — at this size it's the difference between
 * a faceted micro-diamond and a fuzzy blob in the HDR reflection.
 */
function accentDiamondGeometry(size = 0.05) {
  return brilliantDiamondGeometry({
    girdleRadius: size,
    segments: 16,
  });
}

/* ─────────────────────────────────────────────
   PEARL with subtle drill-hole indication
───────────────────────────────────────────── */
function pearlGeometry(radius = 0.1) {
  return new THREE.SphereGeometry(radius, 32, 24);
}

/* ─────────────────────────────────────────────
   PRONG / CLAW
   Tapered cylinder with a rounded tip — looks
   like a real jewellery prong holding a stone.
───────────────────────────────────────────── */
function prongGeometry(height = 0.22, base = 0.022, tip = 0.014) {
  const stem = new THREE.CylinderGeometry(tip, base, height, 8, 1, false);
  stem.translate(0, height / 2, 0);
  // Round tip — small sphere at the top
  const cap = new THREE.SphereGeometry(tip * 1.05, 8, 6);
  cap.translate(0, height, 0);
  return mergeGeometries([stem, cap], false);
}

/**
 * 4 or 6 prongs arranged around (0, 0, 0) at a given radius, all leaning
 * very slightly inward to grip a centre stone.
 */
function addProngs(group, mat, count = 4, radius = 0.13, height = 0.22, name = 'prong') {
  const inwardLean = 0.08;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + Math.PI / count;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const prong = meshNode(
      prongGeometry(height),
      mat,
      [x, 0, z],
      [Math.sin(angle) * inwardLean, 0, -Math.cos(angle) * inwardLean],
      [1, 1, 1],
      `${name}_${i}`,
    );
    group.add(prong);
  }
}

/* ─────────────────────────────────────────────
   PAVÉ HALO — small bezel-set diamonds in a ring
───────────────────────────────────────────── */
function addPaveHalo(group, mat, { radius, y, count, stoneSize = 0.05, ovalY = 1, z = 0 }) {
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    group.add(
      meshNode(
        accentDiamondGeometry(stoneSize),
        mat,
        [Math.cos(angle) * radius, Math.sin(angle) * radius * ovalY + y, z],
        [0, 0, 0],
        [1, 1, 1],
        'halo_diamond',
      ),
    );
  }
}

/* ─────────────────────────────────────────────
   RING — D-section band, cathedral 4-prong, hero
   stone, optional halo and pavé on shoulders.
───────────────────────────────────────────── */
function buildRing(product) {
  const mats = createMaterials(product);
  const seed = hash(product.slug);
  const group = new THREE.Group();
  group.name = `${product.slug}_ring`;
  group.rotation.x = Math.PI * 0.18;

  const bandRadius = 0.92 + (seed % 9) * 0.012;
  const bandThickness = 0.085 + (seed % 3) * 0.01;

  // Main band — high-poly torus.
  group.add(
    meshNode(
      new THREE.TorusGeometry(bandRadius, bandThickness, 56, 196),
      mats.metal,
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 0.78], // squish on Z gives a subtle D-profile illusion
      'gold_band',
    ),
  );

  // Cathedral head — small sloped pillars connecting band to centre stone.
  for (const sign of [-1, 1]) {
    const head = new THREE.CylinderGeometry(0.032, 0.05, 0.22, 12);
    group.add(
      meshNode(
        head,
        mats.metal,
        [sign * 0.085, bandRadius + 0.05, 0],
        [0, 0, sign * 0.18],
        [1, 1, 1],
        'cathedral_pillar',
      ),
    );
  }

  // Stone position — sits proud above the band.
  const stoneY = bandRadius + 0.27;
  const stoneScale = 1 + (seed % 5) * 0.07;

  // Hero brilliant-cut diamond / coloured stone.
  group.add(
    meshNode(
      brilliantDiamondGeometry({
        girdleRadius: 0.18 * stoneScale,
        tableRadius: 0.115 * stoneScale,
        crownHeight: 0.07 * stoneScale,
        girdleHeight: 0.012 * stoneScale,
        pavilionHeight: 0.21 * stoneScale,
        segments: 32,
      }),
      mats.gem,
      [0, stoneY, 0],
      [0, 0, 0],
      [1, 1, 1],
      'hero_gemstone',
    ),
  );

  // Four prongs hugging the stone.
  const setting = new THREE.Group();
  setting.position.set(0, stoneY - 0.05, 0);
  addProngs(setting, mats.metal, 4, 0.16 * stoneScale, 0.22 * stoneScale, 'hero_prong');
  group.add(setting);

  // Halo of accent diamonds around the centre stone (if implied by tags).
  const tags = (product.tags || []).join(' ').toLowerCase();
  const wantsHalo =
    product.subCategory?.toLowerCase().includes('halo') ||
    tags.includes('halo') ||
    tags.includes('diamond');
  if (wantsHalo) {
    addPaveHalo(group, mats.diamond, {
      radius: 0.27 * stoneScale,
      y: stoneY - 0.02,
      count: 14,
      stoneSize: 0.045,
    });
  }

  // Pavé along the band shoulders (front-facing 60% arc).
  const paveCount = 18;
  for (let i = 0; i < paveCount; i += 1) {
    // Distribute on the front of the band only (avoid the back).
    const t = -0.4 + (i / (paveCount - 1)) * 0.8; // -0.4 .. +0.4 of a full turn
    const angle = Math.PI / 2 + t * Math.PI;
    const x = Math.cos(angle) * bandRadius;
    const y = Math.sin(angle) * bandRadius;
    group.add(
      meshNode(
        accentDiamondGeometry(0.038),
        mats.diamond,
        [x, y, bandThickness * 0.55],
        [0, 0, 0],
        [1, 1, 1],
        'shoulder_diamond',
      ),
    );
  }

  return group;
}

/* ─────────────────────────────────────────────
   NECKLACE — chain along a soft V-curve, with a
   bezel-set pendant + bail OR a strand of pearls.
───────────────────────────────────────────── */
function buildNecklace(product) {
  const mats = createMaterials(product);
  const seed = hash(product.slug);
  const group = new THREE.Group();
  group.name = `${product.slug}_necklace`;

  // Chain curve — a graceful wide V across the chest.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.45, 0.65, 0),
    new THREE.Vector3(-0.85, 0.18, 0.04),
    new THREE.Vector3(-0.35, -0.18, 0.02),
    new THREE.Vector3(0, -0.32, 0),
    new THREE.Vector3(0.35, -0.18, 0.02),
    new THREE.Vector3(0.85, 0.18, 0.04),
    new THREE.Vector3(1.45, 0.65, 0),
  ]);

  const isPearl = `${product.gemstone} ${product.name}`.toLowerCase().includes('pearl');

  if (isPearl) {
    // Pearl strand — graduated round pearls.
    const N = 27;
    for (let i = 0; i < N; i += 1) {
      const t = i / (N - 1);
      const point = curve.getPointAt(t);
      const sizeBoost = Math.sin(t * Math.PI); // bigger pearls in centre
      const r = 0.08 + sizeBoost * 0.038;
      group.add(
        meshNode(
          pearlGeometry(r),
          mats.gem,
          [point.x, point.y, point.z],
          [0, 0, 0],
          [1, 1, 1],
          'pearl',
        ),
      );
    }
    // Small gold clasp at one end.
    group.add(
      meshNode(
        new THREE.CylinderGeometry(0.05, 0.05, 0.1, 16),
        mats.metal,
        [1.45, 0.65, 0],
        [0, 0, Math.PI / 2],
        [1, 1, 1],
        'clasp',
      ),
    );
    return group;
  }

  // Chain — tube along the curve.
  group.add(
    meshNode(
      new THREE.TubeGeometry(curve, 96, 0.024 + (seed % 3) * 0.005, 12, false),
      mats.metal,
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1],
      'chain',
    ),
  );

  // Pendant cluster at the bottom of the curve.
  const pendantY = -0.5;

  // Bail — small jump-ring connecting pendant to chain.
  group.add(
    meshNode(
      new THREE.TorusGeometry(0.045, 0.012, 12, 32),
      mats.metal,
      [0, -0.34, 0],
      [Math.PI / 2, 0, 0],
      [1, 1, 1],
      'bail',
    ),
  );

  // Bezel — outer frame of pendant.
  group.add(
    meshNode(
      new THREE.TorusGeometry(0.16, 0.024, 36, 96),
      mats.metal,
      [0, pendantY, 0],
      [0, 0, 0],
      [1, 1.05, 1],
      'pendant_bezel',
    ),
  );
  // Pendant gem — proper brilliant cut.
  group.add(
    meshNode(
      brilliantDiamondGeometry({
        girdleRadius: 0.14,
        tableRadius: 0.09,
        crownHeight: 0.05,
        girdleHeight: 0.01,
        pavilionHeight: 0.16,
        segments: 32,
      }),
      mats.gem,
      [0, pendantY, 0],
      [0, 0, 0],
      [1, 1, 1],
      'pendant_gemstone',
    ),
  );

  // Pavé halo if "halo"-style design.
  const tags = (product.tags || []).join(' ').toLowerCase();
  if (tags.includes('halo') || product.subCategory?.toLowerCase().includes('halo')) {
    addPaveHalo(group, mats.diamond, {
      radius: 0.21,
      y: pendantY,
      count: 14,
      stoneSize: 0.035,
    });
  }

  return group;
}

/* ─────────────────────────────────────────────
   EARRINGS — two mirrored components: hook,
   post connector, bezel-set drop or stud.
───────────────────────────────────────────── */
function buildEarrings(product) {
  const mats = createMaterials(product);
  const seed = hash(product.slug);
  const group = new THREE.Group();
  group.name = `${product.slug}_earrings`;
  group.rotation.x = -Math.PI * 0.05;

  const isDrop =
    product.subCategory?.toLowerCase().includes('drop') ||
    product.subCategory?.toLowerCase().includes('chandelier') ||
    product.name.toLowerCase().includes('jhumka') ||
    (product.tags || []).join(' ').toLowerCase().includes('drop');

  for (const x of [-0.42, 0.42]) {
    // French hook (open ear-wire).
    group.add(
      meshNode(
        new THREE.TorusGeometry(0.14, 0.016, 12, 28, Math.PI * 1.1),
        mats.metal,
        [x, 0.34, 0],
        [0, 0, 0],
        [1, 1, 1],
        'ear_hook',
      ),
    );

    if (isDrop) {
      // Connector wire from hook to drop body.
      group.add(
        meshNode(
          new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8),
          mats.metal,
          [x, 0.08, 0],
          [0, 0, 0],
          [1, 1, 1],
          'drop_wire',
        ),
      );

      // Bezel housing the drop stone.
      group.add(
        meshNode(
          new THREE.TorusGeometry(0.13, 0.022, 24, 64),
          mats.metal,
          [x, -0.18, 0],
          [0, 0, 0],
          [1, 1.15, 1],
          'drop_bezel',
        ),
      );

      // Drop gemstone — pear cut approximated with elongated brilliant.
      group.add(
        meshNode(
          brilliantDiamondGeometry({
            girdleRadius: 0.11,
            tableRadius: 0.07,
            crownHeight: 0.05,
            girdleHeight: 0.01,
            pavilionHeight: 0.2,
            segments: 32,
          }),
          mats.gem,
          [x, -0.18, 0],
          [0, 0, 0],
          [1, 1.1, 1],
          'drop_gemstone',
        ),
      );

      // Pavé halo around the drop.
      addPaveHalo(group, mats.diamond, {
        radius: 0.16,
        y: -0.18,
        count: 12,
        stoneSize: 0.03,
        ovalY: 1.15,
      });
    } else {
      // Stud — flat back disc + 4-prong setting + brilliant cut.
      group.add(
        meshNode(
          new THREE.CylinderGeometry(0.16, 0.18, 0.05, 24),
          mats.metal,
          [x, 0, -0.04],
          [Math.PI / 2, 0, 0],
          [1, 1, 1],
          'stud_base',
        ),
      );
      const stoneSize = 0.95 + (seed % 4) * 0.06;
      group.add(
        meshNode(
          brilliantDiamondGeometry({
            girdleRadius: 0.13 * stoneSize,
            tableRadius: 0.08 * stoneSize,
            crownHeight: 0.05 * stoneSize,
            girdleHeight: 0.01 * stoneSize,
            pavilionHeight: 0.16 * stoneSize,
            segments: 32,
          }),
          mats.gem,
          [x, 0, 0.06],
          [0, 0, 0],
          [1, 1, 1],
          'stud_gemstone',
        ),
      );
      // Four prongs.
      const setting = new THREE.Group();
      setting.position.set(x, 0, -0.05);
      setting.rotation.x = Math.PI / 2;
      addProngs(setting, mats.metal, 4, 0.115 * stoneSize, 0.16 * stoneSize, 'stud_prong');
      group.add(setting);
    }
  }

  return group;
}

/* ─────────────────────────────────────────────
   BRACELET — link tennis-style bezelled stones
   OR rigid cuff with milgrain edge.
───────────────────────────────────────────── */
function buildBracelet(product) {
  const mats = createMaterials(product);
  const seed = hash(product.slug);
  const group = new THREE.Group();
  group.name = `${product.slug}_bracelet`;
  group.rotation.x = Math.PI * 0.22;

  const isCuff =
    `${product.subCategory} ${product.name}`.toLowerCase().includes('cuff') ||
    product.category === 'Bangles';

  if (isCuff) {
    // Cuff body — main band.
    group.add(
      meshNode(
        new THREE.TorusGeometry(0.86, 0.085 + (seed % 3) * 0.012, 56, 200, Math.PI * 1.7),
        mats.metal,
        [0, 0, 0],
        [0, 0, Math.PI * 0.15],
        [1.22, 0.74, 0.36],
        'cuff_body',
      ),
    );

    // Milgrain edge — two thin rings flanking the main band.
    for (const offset of [-0.05, 0.05]) {
      group.add(
        meshNode(
          new THREE.TorusGeometry(0.86 + offset, 0.012, 24, 200, Math.PI * 1.7),
          mats.metal,
          [0, 0, 0],
          [0, 0, Math.PI * 0.15],
          [1.22, 0.74, 0.36],
          'cuff_edge',
        ),
      );
    }

    // Three accent stones across the front.
    for (let i = -1; i <= 1; i += 1) {
      const angle = Math.PI * 0.5 + i * 0.18;
      const x = Math.cos(angle) * 1.04 * 1.22;
      const y = Math.sin(angle) * 1.04 * 0.74;
      group.add(
        meshNode(
          new THREE.TorusGeometry(0.06, 0.014, 16, 32),
          mats.metal,
          [x, y, 0.16],
          [0, 0, 0],
          [1, 1, 1],
          'cuff_bezel',
        ),
      );
      group.add(
        meshNode(
          brilliantDiamondGeometry({
            girdleRadius: 0.05,
            tableRadius: 0.032,
            crownHeight: 0.018,
            girdleHeight: 0.005,
            pavilionHeight: 0.07,
            segments: 16,
          }),
          mats.gem,
          [x, y, 0.16],
          [0, 0, 0],
          [1, 1, 1],
          'cuff_gemstone',
        ),
      );
    }
    return group;
  }

  // Tennis bracelet — chain of bezel-set oval stones.
  const linkCount = 24 + (seed % 8);
  const Rx = 1.14;
  const Ry = 0.62;
  for (let i = 0; i < linkCount; i += 1) {
    const angle = (i / linkCount) * Math.PI * 2;
    const x = Math.cos(angle) * Rx;
    const y = Math.sin(angle) * Ry;
    const tangent = angle + Math.PI / 2;

    // Bezel — small flattened torus.
    group.add(
      meshNode(
        new THREE.TorusGeometry(0.058, 0.012, 12, 24),
        mats.metal,
        [x, y, 0],
        [Math.PI / 2, 0, tangent],
        [1, 1, 1],
        'tennis_bezel',
      ),
    );

    // Linking bar between this and the next stone.
    if (i < linkCount) {
      const nextAngle = ((i + 1) / linkCount) * Math.PI * 2;
      const xn = Math.cos(nextAngle) * Rx;
      const yn = Math.sin(nextAngle) * Ry;
      const midX = (x + xn) / 2;
      const midY = (y + yn) / 2;
      const dx = xn - x;
      const dy = yn - y;
      const len = Math.sqrt(dx * dx + dy * dy) - 0.08;
      group.add(
        meshNode(
          new THREE.CylinderGeometry(0.014, 0.014, Math.max(len, 0.04), 8),
          mats.metal,
          [midX, midY, 0],
          [0, 0, Math.atan2(dy, dx) - Math.PI / 2],
          [1, 1, 1],
          'tennis_link',
        ),
      );
    }

    // Stone in each bezel.
    group.add(
      meshNode(
        brilliantDiamondGeometry({
          girdleRadius: 0.045,
          tableRadius: 0.028,
          crownHeight: 0.015,
          girdleHeight: 0.005,
          pavilionHeight: 0.058,
          segments: 16,
        }),
        mats.gem,
        [x, y, 0.018],
        [0, 0, 0],
        [1, 1, 1],
        'tennis_gemstone',
      ),
    );
  }

  return group;
}

/* ─────────────────────────────────────────────
   ROPE / BOX / PAPERCLIP CHAIN
───────────────────────────────────────────── */
function buildChain(product) {
  const mats = createMaterials(product);
  const group = new THREE.Group();
  group.name = `${product.slug}_chain`;

  // Tube along a gentle U-curve.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.5, 0.72, 0),
    new THREE.Vector3(-0.95, 0.2, 0.04),
    new THREE.Vector3(-0.35, -0.2, 0),
    new THREE.Vector3(0, -0.32, 0),
    new THREE.Vector3(0.35, -0.2, 0),
    new THREE.Vector3(0.95, 0.2, 0.04),
    new THREE.Vector3(1.5, 0.72, 0),
  ]);
  group.add(
    meshNode(
      new THREE.TubeGeometry(curve, 120, 0.03, 14, false),
      mats.metal,
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1],
      'chain_body',
    ),
  );

  // Decorative oval-link "rope" detail along the curve length.
  const linkCount = 38;
  for (let i = 0; i < linkCount; i += 1) {
    const t = i / (linkCount - 1);
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const tilt = Math.atan2(tangent.y, tangent.x);
    group.add(
      meshNode(
        new THREE.TorusGeometry(0.045, 0.008, 8, 16),
        mats.metal,
        [point.x, point.y, point.z + 0.02],
        [Math.PI / 2, 0, tilt],
        [1.3, 0.7, 1],
        'chain_link',
      ),
    );
  }

  return group;
}

/* ─────────────────────────────────────────────
   PRODUCT → BUILDER DISPATCH
───────────────────────────────────────────── */
function buildModelFor(product) {
  const cat = product.category || '';
  const sub = (product.subCategory || '').toLowerCase();
  if (cat === 'Rings' || cat === 'Couple Rings' || sub.includes('ring')) return buildRing(product);
  if (cat === 'Earrings' || sub.includes('earring') || sub.includes('jhumka')) return buildEarrings(product);
  if (cat === 'Bracelets' || cat === 'Bangles' || sub.includes('bracelet') || sub.includes('bangle') || sub.includes('kada')) return buildBracelet(product);
  if (cat === 'Chains' || sub.includes('chain')) return buildChain(product);
  return buildNecklace(product);
}

/* ─────────────────────────────────────────────
   SVG THUMBNAILS — unchanged premium illustration
───────────────────────────────────────────── */
function svgFor(product, variant = 'front') {
  const metal = palette[metalKey(product)];
  const gem = palette[gemKey(product)];
  const accent = palette.diamond;
  const title = product.name.replace(/&/g, 'and');
  const type = product.category;
  const seed = hash(`${product.slug}-${variant}`);
  const rotate = variant === 'angle' ? -12 : variant === 'detail' ? 8 : 0;
  const zoom = variant === 'detail' ? 1.14 : 1;
  const bg = variant === 'detail' ? '#F7F3EC' : '#FBFAF7';

  const shape = (() => {
    if (type.includes('Ring') || product.subCategory?.includes('Ring')) {
      return `<g transform="translate(600 620) rotate(${rotate}) scale(${zoom})">
        <ellipse cx="0" cy="35" rx="260" ry="178" fill="none" stroke="${metal}" stroke-width="54"/>
        <ellipse cx="0" cy="35" rx="190" ry="120" fill="none" stroke="#FFFFFF" stroke-opacity="0.28" stroke-width="10"/>
        <path d="M-80 -142H80L52 -70H-52Z" fill="${metal}"/>
        <polygon points="0,-274 96,-166 46,-82 -46,-82 -96,-166" fill="${gem}"/>
        <circle cx="0" cy="-142" r="${38 + (seed % 16)}" fill="${accent}" fill-opacity="0.82"/>
      </g>`;
    }
    if (type.includes('Earring') || product.subCategory?.includes('Earring') || product.subCategory?.includes('Jhumka')) {
      return `<g transform="translate(600 580) rotate(${rotate}) scale(${zoom})">
        <g transform="translate(-160 0)"><circle cy="-170" r="74" fill="none" stroke="${metal}" stroke-width="34"/><path d="M0 -72C84 10 112 128 0 226C-112 128 -84 10 0 -72Z" fill="${metal}"/><circle cy="68" r="54" fill="${gem}"/></g>
        <g transform="translate(160 0)"><circle cy="-170" r="74" fill="none" stroke="${metal}" stroke-width="34"/><path d="M0 -72C84 10 112 128 0 226C-112 128 -84 10 0 -72Z" fill="${metal}"/><circle cy="68" r="54" fill="${gem}"/></g>
      </g>`;
    }
    if (type.includes('Bracelet') || type.includes('Bangle')) {
      return `<g transform="translate(600 610) rotate(${rotate}) scale(${zoom})">
        <ellipse rx="340" ry="160" fill="none" stroke="${metal}" stroke-width="72"/>
        <ellipse rx="242" ry="96" fill="none" stroke="#FFFFFF" stroke-opacity="0.32" stroke-width="12"/>
        ${Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return `<circle cx="${Math.cos(angle) * 305}" cy="${Math.sin(angle) * 135}" r="24" fill="${gem}"/>`;
        }).join('')}
      </g>`;
    }
    if (type.includes('Chain')) {
      return `<g transform="translate(600 610) rotate(${rotate}) scale(${zoom})">${Array.from({ length: 18 }, (_, i) => {
        const x = (i - 8.5) * 42;
        const y = Math.sin(i * 0.8) * 34;
        return `<ellipse cx="${x}" cy="${y}" rx="45" ry="25" fill="none" stroke="${metal}" stroke-width="18" transform="rotate(${i % 2 ? 25 : -25} ${x} ${y})"/>`;
      }).join('')}</g>`;
    }
    return `<g transform="translate(600 565) rotate(${rotate}) scale(${zoom})">
      <path d="M250 -110C160 210 -160 210 -250 -110" fill="none" stroke="${metal}" stroke-width="34" stroke-linecap="round"/>
      <circle cx="0" cy="210" r="102" fill="none" stroke="${metal}" stroke-width="34"/>
      <polygon points="0,72 94,184 44,300 -44,300 -94,184" fill="${gem}"/>
      <circle cx="0" cy="210" r="38" fill="${accent}" fill-opacity="0.86"/>
    </g>`;
  })();

  return `<svg width="1200" height="1200" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="1200" fill="${bg}"/>
    <circle cx="600" cy="560" r="430" fill="${metal}" fill-opacity="0.055"/>
    <ellipse cx="600" cy="905" rx="330" ry="52" fill="#000000" fill-opacity="0.08"/>
    <g filter="url(#shadow)">${shape}</g>
    <text x="600" y="1060" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#28221A">${title}</text>
    <text x="600" y="1110" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" letter-spacing="5" fill="#9A7A2F">${product.material.toUpperCase()}</text>
    <defs><filter id="shadow" x="90" y="80" width="1020" height="900" filterUnits="userSpaceOnUse"><feDropShadow dx="0" dy="34" stdDeviation="30" flood-color="#000000" flood-opacity="0.18"/></filter></defs>
  </svg>`;
}

/* ─────────────────────────────────────────────
   I/O
───────────────────────────────────────────── */
function toDiskPath(publicPath) {
  return path.join(root, 'public', publicPath.replace(/^\//, ''));
}

async function writeSvgSet(product) {
  if (!product.gallery) return;
  const [front, angle, detail] = product.gallery;
  for (const [target, variant] of [
    [front, 'front'],
    [angle, 'angle'],
    [detail, 'detail'],
  ]) {
    if (!target) continue;
    const filePath = toDiskPath(target);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, svgFor(product, variant));
  }
}

async function writeModel(product) {
  const scene = new THREE.Scene();
  scene.add(buildModelFor(product));
  const filePath = toDiskPath(product.model3D);
  await mkdir(path.dirname(filePath), { recursive: true });
  const arrayBuffer = await exporter.parseAsync(scene, {
    binary: true,
    trs: false,
    onlyVisible: true,
    truncateDrawRange: true,
  });
  await writeFile(filePath, Buffer.from(arrayBuffer));
}

let count = 0;
for (const product of PRODUCTS) {
  await writeSvgSet(product);
  await writeModel(product);
  count += 1;
  console.log(`  ✓ [${count}/${PRODUCTS.length}] ${product.name}`);
}

for (const category of CATEGORIES) {
  const product =
    PRODUCTS.find((item) => item.image === category.image) ||
    PRODUCTS.find((item) => item.category === category.name);
  if (product) {
    const filePath = toDiskPath(category.image);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, svgFor(product, 'front'));
  }
}

console.log(`\nGenerated ${PRODUCTS.length} jewellery models + thumbnails.`);
