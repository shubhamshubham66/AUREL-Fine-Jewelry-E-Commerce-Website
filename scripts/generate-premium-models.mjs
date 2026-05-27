/**
 * AUREL — Premium Jewelry Model Generator v3 (Zero Dependencies)
 * 
 * Writes .glb files directly using the glTF 2.0 binary spec.
 * No THREE.js, no npm packages required.
 *
 * Usage: node scripts/generate-premium-models.mjs
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { statSync } from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = path.resolve('public/models');


// ─── GLB WRITER (raw binary glTF 2.0) ───

function buildGLB(json, binBuffers) {
  // Combine all binary buffers
  const bin = Buffer.concat(binBuffers);
  const jsonStr = JSON.stringify(json);
  // Pad JSON to 4-byte alignment
  const jsonPad = jsonStr.length % 4 === 0 ? '' : ' '.repeat(4 - (jsonStr.length % 4));
  const jsonBuf = Buffer.from(jsonStr + jsonPad, 'utf8');
  // Pad binary to 4-byte alignment
  const binPadLen = bin.length % 4 === 0 ? 0 : 4 - (bin.length % 4);
  const binPad = Buffer.alloc(binPadLen);
  const binTotal = Buffer.concat([bin, binPad]);

  // GLB header: magic + version + length
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // glTF magic
  header.writeUInt32LE(2, 4);          // version 2
  const totalLen = 12 + 8 + jsonBuf.length + 8 + binTotal.length;
  header.writeUInt32LE(totalLen, 8);

  // JSON chunk header
  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuf.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // JSON

  // BIN chunk header
  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binTotal.length, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // BIN

  return Buffer.concat([header, jsonChunkHeader, jsonBuf, binChunkHeader, binTotal]);
}


// ─── GEOMETRY PRIMITIVES ───

/** Generate vertices and indices for a torus */
function genTorus(majorR, minorR, majorSegs = 64, minorSegs = 24, arc = Math.PI * 2) {
  const verts = [], norms = [], indices = [];
  for (let j = 0; j <= majorSegs; j++) {
    const u = (j / majorSegs) * arc;
    const cu = Math.cos(u), su = Math.sin(u);
    for (let i = 0; i <= minorSegs; i++) {
      const v = (i / minorSegs) * Math.PI * 2;
      const cv = Math.cos(v), sv = Math.sin(v);
      const x = (majorR + minorR * cv) * cu;
      const y = minorR * sv;
      const z = (majorR + minorR * cv) * su;
      verts.push(x, y, z);
      const nx = cv * cu, ny = sv, nz = cv * su;
      norms.push(nx, ny, nz);
    }
  }
  for (let j = 0; j < majorSegs; j++) {
    for (let i = 0; i < minorSegs; i++) {
      const a = j * (minorSegs + 1) + i;
      const b = a + minorSegs + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { verts: new Float32Array(verts), norms: new Float32Array(norms), indices: new Uint16Array(indices) };
}

/** Generate cylinder/cone */
function genCylinder(radiusTop, radiusBot, height, radialSegs = 32, heightSegs = 1, openEnded = false) {
  const verts = [], norms = [], indices = [];
  const slope = (radiusBot - radiusTop) / height;
  // Side vertices
  for (let y = 0; y <= heightSegs; y++) {
    const t = y / heightSegs;
    const r = radiusTop + (radiusBot - radiusTop) * t;
    const yPos = height / 2 - t * height;
    for (let x = 0; x <= radialSegs; x++) {
      const u = (x / radialSegs) * Math.PI * 2;
      const cx = Math.cos(u), sz = Math.sin(u);
      verts.push(cx * r, yPos, sz * r);
      const ny = slope / Math.sqrt(1 + slope * slope);
      const nr = 1 / Math.sqrt(1 + slope * slope);
      norms.push(cx * nr, ny, sz * nr);
    }
  }
  for (let y = 0; y < heightSegs; y++) {
    for (let x = 0; x < radialSegs; x++) {
      const a = y * (radialSegs + 1) + x;
      const b = a + radialSegs + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  if (!openEnded) {
    // Top cap
    const topCenter = verts.length / 3;
    verts.push(0, height / 2, 0); norms.push(0, 1, 0);
    for (let x = 0; x <= radialSegs; x++) {
      const u = (x / radialSegs) * Math.PI * 2;
      verts.push(Math.cos(u) * radiusTop, height / 2, Math.sin(u) * radiusTop);
      norms.push(0, 1, 0);
    }
    for (let x = 0; x < radialSegs; x++) {
      indices.push(topCenter, topCenter + 1 + x, topCenter + 2 + x);
    }
    // Bottom cap
    const botCenter = verts.length / 3;
    verts.push(0, -height / 2, 0); norms.push(0, -1, 0);
    for (let x = 0; x <= radialSegs; x++) {
      const u = (x / radialSegs) * Math.PI * 2;
      verts.push(Math.cos(u) * radiusBot, -height / 2, Math.sin(u) * radiusBot);
      norms.push(0, -1, 0);
    }
    for (let x = 0; x < radialSegs; x++) {
      indices.push(botCenter, botCenter + 2 + x, botCenter + 1 + x);
    }
  }
  return { verts: new Float32Array(verts), norms: new Float32Array(norms), indices: new Uint16Array(indices) };
}

/** Generate sphere */
function genSphere(radius, wSegs = 24, hSegs = 16) {
  const verts = [], norms = [], indices = [];
  for (let y = 0; y <= hSegs; y++) {
    const v = y / hSegs, phi = v * Math.PI;
    for (let x = 0; x <= wSegs; x++) {
      const u = x / wSegs, theta = u * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      verts.push(nx * radius, ny * radius, nz * radius);
      norms.push(nx, ny, nz);
    }
  }
  for (let y = 0; y < hSegs; y++) {
    for (let x = 0; x < wSegs; x++) {
      const a = y * (wSegs + 1) + x, b = a + wSegs + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { verts: new Float32Array(verts), norms: new Float32Array(norms), indices: new Uint16Array(indices) };
}


// ─── TRANSFORM HELPERS ───

function transformVerts(verts, { translate, scale, rotateX, rotateY, rotateZ } = {}) {
  const out = new Float32Array(verts.length);
  for (let i = 0; i < verts.length; i += 3) {
    let x = verts[i], y = verts[i+1], z = verts[i+2];
    if (scale) { x *= scale[0]; y *= scale[1]; z *= scale[2]; }
    if (rotateX) { const c = Math.cos(rotateX), s = Math.sin(rotateX); const ny = y*c - z*s, nz = y*s + z*c; y = ny; z = nz; }
    if (rotateY) { const c = Math.cos(rotateY), s = Math.sin(rotateY); const nx = x*c + z*s, nz = -x*s + z*c; x = nx; z = nz; }
    if (rotateZ) { const c = Math.cos(rotateZ), s = Math.sin(rotateZ); const nx = x*c - y*s, ny = x*s + y*c; x = nx; y = ny; }
    if (translate) { x += translate[0]; y += translate[1]; z += translate[2]; }
    out[i] = x; out[i+1] = y; out[i+2] = z;
  }
  return out;
}

function transformNorms(norms, { rotateX, rotateY, rotateZ } = {}) {
  const out = new Float32Array(norms.length);
  for (let i = 0; i < norms.length; i += 3) {
    let x = norms[i], y = norms[i+1], z = norms[i+2];
    if (rotateX) { const c = Math.cos(rotateX), s = Math.sin(rotateX); const ny = y*c - z*s, nz = y*s + z*c; y = ny; z = nz; }
    if (rotateY) { const c = Math.cos(rotateY), s = Math.sin(rotateY); const nx = x*c + z*s, nz = -x*s + z*c; x = nx; z = nz; }
    if (rotateZ) { const c = Math.cos(rotateZ), s = Math.sin(rotateZ); const nx = x*c - y*s, ny = x*s + y*c; x = nx; y = ny; }
    out[i] = x; out[i+1] = y; out[i+2] = z;
  }
  return out;
}

/** Merge multiple meshes into one */
function mergeMeshes(meshes) {
  let totalVerts = 0, totalIdx = 0;
  for (const m of meshes) { totalVerts += m.verts.length / 3; totalIdx += m.indices.length; }
  const verts = new Float32Array(totalVerts * 3);
  const norms = new Float32Array(totalVerts * 3);
  const indices = totalVerts > 65535 ? new Uint32Array(totalIdx) : new Uint16Array(totalIdx);
  let vOff = 0, iOff = 0, baseVertex = 0;
  for (const m of meshes) {
    verts.set(m.verts, vOff * 3);
    norms.set(m.norms, vOff * 3);
    for (let i = 0; i < m.indices.length; i++) {
      indices[iOff + i] = m.indices[i] + baseVertex;
    }
    baseVertex += m.verts.length / 3;
    vOff += m.verts.length / 3;
    iOff += m.indices.length;
  }
  return { verts, norms, indices };
}


// ─── GLB SCENE BUILDER ───

function buildSceneGLB(meshGroups) {
  // meshGroups: [{ name, meshes: [{verts, norms, indices}], materialName }]
  const bufferViews = [];
  const accessors = [];
  const meshesGltf = [];
  const nodes = [];
  const materials = [];
  const materialMap = {};
  const binParts = [];
  let byteOffset = 0;

  function getOrCreateMaterial(matName) {
    if (materialMap[matName] !== undefined) return materialMap[matName];
    const idx = materials.length;
    materialMap[matName] = idx;
    const isGold = matName.includes('gold') || matName.includes('metal');
    const isDiamond = matName.includes('diamond') || matName.includes('stone') || matName.includes('gem') || matName.includes('crystal');
    if (isDiamond) {
      materials.push({ name: matName, pbrMetallicRoughness: { baseColorFactor: [0.97, 0.99, 1, 1], metallicFactor: 0, roughnessFactor: 0.01 } });
    } else {
      materials.push({ name: matName, pbrMetallicRoughness: { baseColorFactor: [0.83, 0.69, 0.22, 1], metallicFactor: 1, roughnessFactor: 0.1 } });
    }
    return idx;
  }

  for (const group of meshGroups) {
    const merged = mergeMeshes(group.meshes);
    const matIdx = getOrCreateMaterial(group.materialName || group.name);

    // Compute bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < merged.verts.length; i += 3) {
      const x = merged.verts[i], y = merged.verts[i+1], z = merged.verts[i+2];
      if (x < minX) minX = x; if (y < minY) minY = y; if (z < minZ) minZ = z;
      if (x > maxX) maxX = x; if (y > maxY) maxY = y; if (z > maxZ) maxZ = z;
    }

    // Index buffer view
    const idxBuf = Buffer.from(merged.indices.buffer, merged.indices.byteOffset, merged.indices.byteLength);
    const idxPad = (4 - idxBuf.length % 4) % 4;
    const idxBufPadded = Buffer.concat([idxBuf, Buffer.alloc(idxPad)]);
    const idxBVIdx = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: idxBuf.length });
    binParts.push(idxBufPadded);
    byteOffset += idxBufPadded.length;

    // Position buffer view
    const posBuf = Buffer.from(merged.verts.buffer, merged.verts.byteOffset, merged.verts.byteLength);
    const posPad = (4 - posBuf.length % 4) % 4;
    const posBufPadded = Buffer.concat([posBuf, Buffer.alloc(posPad)]);
    const posBVIdx = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: posBuf.length, byteStride: 12 });
    binParts.push(posBufPadded);
    byteOffset += posBufPadded.length;

    // Normal buffer view
    const normBuf = Buffer.from(merged.norms.buffer, merged.norms.byteOffset, merged.norms.byteLength);
    const normPad = (4 - normBuf.length % 4) % 4;
    const normBufPadded = Buffer.concat([normBuf, Buffer.alloc(normPad)]);
    const normBVIdx = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: normBuf.length, byteStride: 12 });
    binParts.push(normBufPadded);
    byteOffset += normBufPadded.length;

    // Accessors
    const idxAccIdx = accessors.length;
    const componentType = merged.indices instanceof Uint32Array ? 5125 : 5123;
    accessors.push({ bufferView: idxBVIdx, byteOffset: 0, componentType, count: merged.indices.length, type: 'SCALAR' });

    const posAccIdx = accessors.length;
    accessors.push({ bufferView: posBVIdx, byteOffset: 0, componentType: 5126, count: merged.verts.length / 3, type: 'VEC3', min: [minX, minY, minZ], max: [maxX, maxY, maxZ] });

    const normAccIdx = accessors.length;
    accessors.push({ bufferView: normBVIdx, byteOffset: 0, componentType: 5126, count: merged.norms.length / 3, type: 'VEC3' });

    // Mesh
    const meshIdx = meshesGltf.length;
    meshesGltf.push({ name: group.name, primitives: [{ attributes: { POSITION: posAccIdx, NORMAL: normAccIdx }, indices: idxAccIdx, material: matIdx }] });

    // Node
    nodes.push({ name: group.name, mesh: meshIdx });
  }

  const json = {
    asset: { version: '2.0', generator: 'AUREL Premium Generator v3' },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, i) => i) }],
    nodes,
    meshes: meshesGltf,
    accessors,
    bufferViews,
    buffers: [{ byteLength: byteOffset }],
    materials,
  };

  return buildGLB(json, binParts);
}


// ─── JEWELRY MODEL BUILDERS ───

function buildRing() {
  const band = genTorus(0.8, 0.12, 128, 24);
  const bandT = { verts: transformVerts(band.verts, { rotateX: Math.PI/2 }), norms: transformNorms(band.norms, { rotateX: Math.PI/2 }), indices: band.indices };
  // Diamond
  const diamond = genCylinder(0.12, 0.22, 0.12, 16); // crown
  const diamondT = { verts: transformVerts(diamond.verts, { translate: [0, 1.0, 0] }), norms: diamond.norms, indices: diamond.indices };
  const pavilion = genCylinder(0.22, 0.01, 0.2, 16);
  const pavilionT = { verts: transformVerts(pavilion.verts, { translate: [0, 0.82, 0] }), norms: pavilion.norms, indices: pavilion.indices };
  // Prongs
  const prongs = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI/4;
    const prong = genCylinder(0.02, 0.015, 0.22, 8);
    prongs.push({ verts: transformVerts(prong.verts, { translate: [Math.cos(angle)*0.18, 0.95, Math.sin(angle)*0.18], rotateZ: Math.cos(angle)*0.2, rotateX: Math.sin(angle)*0.2 }), norms: prong.norms, indices: prong.indices });
  }
  return buildSceneGLB([
    { name: 'gold_band_metal', meshes: [bandT, ...prongs], materialName: 'gold_metal' },
    { name: 'hero_diamond_stone', meshes: [diamondT, pavilionT], materialName: 'diamond_stone' },
  ]);
}

function buildDiamondRing() {
  const band = genTorus(0.78, 0.1, 128, 24);
  const bandT = { verts: transformVerts(band.verts, { rotateX: Math.PI/2 }), norms: transformNorms(band.norms, { rotateX: Math.PI/2 }), indices: band.indices };
  // Oval diamond
  const crown = genCylinder(0.14, 0.28, 0.14, 20);
  const crownT = { verts: transformVerts(crown.verts, { translate: [0, 1.02, 0], scale: [1.3, 1, 0.85] }), norms: crown.norms, indices: crown.indices };
  const pav = genCylinder(0.28, 0.01, 0.24, 20);
  const pavT = { verts: transformVerts(pav.verts, { translate: [0, 0.81, 0], scale: [1.3, 1, 0.85] }), norms: pav.norms, indices: pav.indices };
  // Halo diamonds
  const halos = [];
  for (let i = 0; i < 20; i++) {
    const a = (i/20)*Math.PI*2;
    const s = genSphere(0.025, 12, 8);
    halos.push({ verts: transformVerts(s.verts, { translate: [Math.cos(a)*0.34, 0.88, Math.sin(a)*0.28] }), norms: s.norms, indices: s.indices });
  }
  const prongs = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i/6)*Math.PI*2;
    const p = genCylinder(0.018, 0.012, 0.2, 8);
    prongs.push({ verts: transformVerts(p.verts, { translate: [Math.cos(angle)*0.22, 0.96, Math.sin(angle)*0.18] }), norms: p.norms, indices: p.indices });
  }
  return buildSceneGLB([
    { name: 'platinum_band_metal', meshes: [bandT, ...prongs], materialName: 'platinum_metal' },
    { name: 'oval_diamond_stone', meshes: [crownT, pavT], materialName: 'diamond_stone' },
    { name: 'halo_diamond_stone', meshes: halos, materialName: 'diamond_stone' },
  ]);
}


function buildNecklace() {
  const links = [];
  const chainR = 2.2;
  for (let i = 0; i < 50; i++) {
    const a = (i/50)*Math.PI;
    const link = genTorus(0.05, 0.012, 16, 8);
    const rot = i % 2 === 0 ? { rotateY: a } : { rotateY: a, rotateX: Math.PI/2 };
    links.push({ verts: transformVerts(link.verts, { ...rot, translate: [Math.cos(a)*chainR, Math.sin(a)*chainR - 1.2, 0] }), norms: transformNorms(link.norms, rot), indices: link.indices });
  }
  const diamonds = [];
  for (let i = 0; i < 11; i++) {
    const t = (i-5)/5;
    const a = Math.PI/2 + t*0.5;
    const size = 0.07*(1-Math.abs(t)*0.4);
    const d = genSphere(size, 16, 12);
    diamonds.push({ verts: transformVerts(d.verts, { translate: [Math.cos(a)*(chainR-0.08), Math.sin(a)*(chainR-0.08)-1.2, 0] }), norms: d.norms, indices: d.indices });
  }
  return buildSceneGLB([
    { name: 'chain_metal', meshes: links, materialName: 'white_metal' },
    { name: 'graduated_diamond_stone', meshes: diamonds, materialName: 'diamond_stone' },
  ]);
}

function buildPendant() {
  // Bail
  const bail = genTorus(0.09, 0.02, 24, 12, Math.PI);
  const bailT = { verts: transformVerts(bail.verts, { translate: [0, 0.6, 0], rotateZ: Math.PI }), norms: transformNorms(bail.norms, { rotateZ: Math.PI }), indices: bail.indices };
  // Disc body
  const disc = genCylinder(0.4, 0.4, 0.04, 64);
  const discT = { verts: transformVerts(disc.verts, {}), norms: disc.norms, indices: disc.indices };
  // Edge bevel
  const edge = genTorus(0.39, 0.025, 64, 12);
  const edgeT = { verts: transformVerts(edge.verts, { rotateX: Math.PI/2 }), norms: transformNorms(edge.norms, { rotateX: Math.PI/2 }), indices: edge.indices };
  // Centre diamond
  const cD = genSphere(0.1, 20, 16);
  const cDT = { verts: transformVerts(cD.verts, { translate: [0, 0.04, 0] }), norms: cD.norms, indices: cD.indices };
  // Ray diamonds
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const a = (i/8)*Math.PI*2;
    const r = genSphere(0.035, 12, 8);
    rays.push({ verts: transformVerts(r.verts, { translate: [Math.cos(a)*0.25, 0.03, Math.sin(a)*0.25] }), norms: r.norms, indices: r.indices });
  }
  // Chain
  const chain = [];
  for (let i = 0; i < 10; i++) {
    const link = genTorus(0.035, 0.008, 12, 8);
    const rot = i%2===0 ? { rotateY: Math.PI/2 } : {};
    chain.push({ verts: transformVerts(link.verts, { ...rot, translate: [0, 0.7+i*0.08, 0] }), norms: transformNorms(link.norms, rot), indices: link.indices });
  }
  return buildSceneGLB([
    { name: 'pendant_body_metal', meshes: [bailT, discT, edgeT, ...chain], materialName: 'gold_metal' },
    { name: 'pendant_diamond_stone', meshes: [cDT, ...rays], materialName: 'diamond_stone' },
  ]);
}


function buildEarrings() {
  const metalParts = [], stoneParts = [];
  for (const side of [-1, 1]) {
    const x = side * 0.5;
    // Hook
    const hook = genTorus(0.1, 0.015, 20, 10, Math.PI*1.3);
    metalParts.push({ verts: transformVerts(hook.verts, { translate: [x, 0.7, 0], rotateZ: -0.3*side }), norms: transformNorms(hook.norms, { rotateZ: -0.3*side }), indices: hook.indices });
    // Teardrop body (sphere stretched)
    const body = genSphere(0.15, 24, 16);
    metalParts.push({ verts: transformVerts(body.verts, { translate: [x, 0.2, 0], scale: [0.7, 1.4, 0.7] }), norms: body.norms, indices: body.indices });
    // Diamond in drop
    const d = genSphere(0.06, 16, 12);
    stoneParts.push({ verts: transformVerts(d.verts, { translate: [x, 0.18, 0] }), norms: d.norms, indices: d.indices });
    // Accent line
    for (let i = 0; i < 4; i++) {
      const acc = genSphere(0.018, 8, 6);
      stoneParts.push({ verts: transformVerts(acc.verts, { translate: [x, 0.45+i*0.06, 0] }), norms: acc.norms, indices: acc.indices });
    }
  }
  return buildSceneGLB([
    { name: 'earring_body_metal', meshes: metalParts, materialName: 'gold_metal' },
    { name: 'earring_diamond_stone', meshes: stoneParts, materialName: 'diamond_stone' },
  ]);
}

function buildBracelet() {
  const metalParts = [], stoneParts = [];
  const R = 1.5, count = 28;
  for (let i = 0; i < count; i++) {
    const a = (i/count)*Math.PI*2;
    // Bezel
    const bezel = genCylinder(0.065, 0.065, 0.04, 16, 1, true);
    metalParts.push({ verts: transformVerts(bezel.verts, { translate: [Math.cos(a)*R, 0, Math.sin(a)*R] }), norms: bezel.norms, indices: bezel.indices });
    // Diamond
    const d = genSphere(0.045, 12, 8);
    stoneParts.push({ verts: transformVerts(d.verts, { translate: [Math.cos(a)*R, 0.02, Math.sin(a)*R] }), norms: d.norms, indices: d.indices });
    // Connecting bar
    const a2 = ((i+1)/count)*Math.PI*2;
    const mx = (Math.cos(a)+Math.cos(a2))/2*R, mz = (Math.sin(a)+Math.sin(a2))/2*R;
    const bar = genCylinder(0.01, 0.01, 0.1, 6);
    const barAngle = Math.atan2(Math.sin(a2)-Math.sin(a), Math.cos(a2)-Math.cos(a));
    metalParts.push({ verts: transformVerts(bar.verts, { translate: [mx, 0, mz], rotateY: -barAngle, rotateZ: Math.PI/2 }), norms: transformNorms(bar.norms, { rotateY: -barAngle, rotateZ: Math.PI/2 }), indices: bar.indices });
  }
  return buildSceneGLB([
    { name: 'bracelet_frame_metal', meshes: metalParts, materialName: 'white_metal' },
    { name: 'bracelet_diamond_stone', meshes: stoneParts, materialName: 'diamond_stone' },
  ]);
}


function buildBangle() {
  // Main body
  const body = genTorus(1.0, 0.13, 128, 24);
  const bodyT = { verts: transformVerts(body.verts, { rotateX: Math.PI/2 }), norms: transformNorms(body.norms, { rotateX: Math.PI/2 }), indices: body.indices };
  // Diamond crest
  const diamonds = [];
  for (let i = 0; i < 9; i++) {
    const a = ((i-4)/20)*Math.PI*2;
    const d = genSphere(0.04, 12, 8);
    diamonds.push({ verts: transformVerts(d.verts, { translate: [Math.cos(a)*1.0, Math.sin(a)*1.0, 0.12] }), norms: d.norms, indices: d.indices });
  }
  // Milgrain beads
  const beads = [];
  for (let i = 0; i < 60; i++) {
    const a = (i/60)*Math.PI*2;
    for (const z of [-0.12, 0.12]) {
      const b = genSphere(0.01, 6, 4);
      beads.push({ verts: transformVerts(b.verts, { translate: [Math.cos(a)*1.0, Math.sin(a)*1.0, z] }), norms: b.norms, indices: b.indices });
    }
  }
  return buildSceneGLB([
    { name: 'bangle_body_metal', meshes: [bodyT, ...beads], materialName: 'gold_metal' },
    { name: 'bangle_diamond_stone', meshes: diamonds, materialName: 'diamond_stone' },
  ]);
}

function buildNoseRing() {
  // Open hoop
  const hoop = genTorus(0.18, 0.022, 32, 12, Math.PI*1.5);
  const hoopT = { verts: hoop.verts, norms: hoop.norms, indices: hoop.indices };
  // Diamond stud at end
  const d = genSphere(0.05, 16, 12);
  const endAngle = 0;
  const dT = { verts: transformVerts(d.verts, { translate: [0.18, 0, 0] }), norms: d.norms, indices: d.indices };
  // Bezel
  const bezel = genCylinder(0.055, 0.055, 0.025, 16, 1, true);
  const bezelT = { verts: transformVerts(bezel.verts, { translate: [0.18, 0, 0] }), norms: bezel.norms, indices: bezel.indices };
  return buildSceneGLB([
    { name: 'nose_hoop_metal', meshes: [hoopT, bezelT], materialName: 'gold_metal' },
    { name: 'nose_diamond_stone', meshes: [dT], materialName: 'diamond_stone' },
  ]);
}

function buildAnklet() {
  const links = [];
  const R = 1.4, count = 45;
  for (let i = 0; i < count; i++) {
    const a = (i/count)*Math.PI*2;
    const link = genTorus(0.035, 0.007, 12, 6);
    const rot = i%2===0 ? { rotateY: a } : { rotateY: a, rotateX: Math.PI/2 };
    links.push({ verts: transformVerts(link.verts, { ...rot, translate: [Math.cos(a)*R, 0, Math.sin(a)*R] }), norms: transformNorms(link.norms, rot), indices: link.indices });
  }
  // Charms
  const charms = [];
  for (let i = 0; i < 5; i++) {
    const a = (i/5)*Math.PI*2;
    const c = genSphere(0.035, 12, 8);
    charms.push({ verts: transformVerts(c.verts, { translate: [Math.cos(a)*R, -0.07, Math.sin(a)*R] }), norms: c.norms, indices: c.indices });
  }
  return buildSceneGLB([
    { name: 'anklet_chain_metal', meshes: [...links, ...charms], materialName: 'gold_metal' },
  ]);
}


function buildLuxurySet() {
  const metalParts = [], stoneParts = [];
  // Necklace arc
  const nR = 2.0;
  for (let i = 0; i < 45; i++) {
    const a = (i/45)*Math.PI;
    const link = genTorus(0.04, 0.01, 12, 6);
    const rot = i%2===0 ? { rotateY: a } : { rotateY: a, rotateX: Math.PI/2 };
    metalParts.push({ verts: transformVerts(link.verts, { ...rot, translate: [Math.cos(a)*nR, Math.sin(a)*nR - 1.0, 0] }), norms: transformNorms(link.norms, rot), indices: link.indices });
  }
  // Centre pear diamond
  const pear = genSphere(0.18, 20, 16);
  stoneParts.push({ verts: transformVerts(pear.verts, { translate: [0, nR*Math.sin(Math.PI/2)-1.2, 0], scale: [0.7, 1.3, 0.7] }), norms: pear.norms, indices: pear.indices });
  // Side diamonds
  for (let i = 0; i < 7; i++) {
    const t = (i-3)/3;
    const a = Math.PI/2 + t*0.35;
    const d = genSphere(0.05, 12, 8);
    stoneParts.push({ verts: transformVerts(d.verts, { translate: [Math.cos(a)*(nR-0.06), Math.sin(a)*(nR-0.06)-1.0, 0] }), norms: d.norms, indices: d.indices });
  }
  // Earrings
  for (const side of [-1, 1]) {
    const x = side * 1.5;
    const hook = genTorus(0.07, 0.01, 16, 8, Math.PI);
    metalParts.push({ verts: transformVerts(hook.verts, { translate: [x, 1.1, 0] }), norms: hook.norms, indices: hook.indices });
    const drop = genSphere(0.08, 16, 12);
    stoneParts.push({ verts: transformVerts(drop.verts, { translate: [x, 0.95, 0] }), norms: drop.norms, indices: drop.indices });
  }
  return buildSceneGLB([
    { name: 'set_chain_metal', meshes: metalParts, materialName: 'white_metal' },
    { name: 'set_diamond_stone', meshes: stoneParts, materialName: 'diamond_stone' },
  ]);
}

// ─── MAIN ───

const MODELS = [
  { name: 'ring', build: buildRing },
  { name: 'diamond-ring', build: buildDiamondRing },
  { name: 'necklace', build: buildNecklace },
  { name: 'pendant', build: buildPendant },
  { name: 'earrings', build: buildEarrings },
  { name: 'bracelet', build: buildBracelet },
  { name: 'bangle', build: buildBangle },
  { name: 'nose-ring', build: buildNoseRing },
  { name: 'anklet', build: buildAnklet },
  { name: 'luxury-set', build: buildLuxurySet },
];

await mkdir(OUTPUT_DIR, { recursive: true });

console.log('AUREL Premium Model Generator v3 (Zero-Dependency)');
console.log('═'.repeat(52));

for (let i = 0; i < MODELS.length; i++) {
  const { name, build } = MODELS[i];
  const glb = build();
  const filePath = path.join(OUTPUT_DIR, `${name}.glb`);
  await writeFile(filePath, glb);
  const size = statSync(filePath).size;
  console.log(`  ✓ [${i+1}/${MODELS.length}] ${name}.glb (${(size/1024).toFixed(0)} KB)`);
}

console.log(`\n✓ All ${MODELS.length} premium models generated.`);
console.log('  Mesh naming convention for PBR override:');
console.log('  *_metal → metallic gold/platinum shader');
console.log('  *_stone / *diamond* → diamond transmission shader');
