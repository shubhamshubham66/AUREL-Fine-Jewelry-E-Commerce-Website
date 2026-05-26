import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { PRODUCTS, CATEGORIES } from "../src/data/products.js";

globalThis.FileReader = class FileReader {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};

const root = path.resolve(".");
const exporter = new GLTFExporter();

const materialPalette = {
  yellow: "#D4AF37",
  rose: "#B76E79",
  white: "#D8DDE2",
  silver: "#C9D0D8",
  platinum: "#E4E7EA",
  diamond: "#F8FCFF",
  pearl: "#F7EFE4",
  ruby: "#9B1028",
  emerald: "#087B55",
  sapphire: "#174A8B",
  black: "#070707",
};

function hash(value) {
  return [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function metalKey(product) {
  const material = `${product.material} ${product.gemstone}`.toLowerCase();
  if (material.includes("rose")) return "rose";
  if (material.includes("white")) return "white";
  if (material.includes("silver")) return "silver";
  if (material.includes("platinum")) return "platinum";
  return "yellow";
}

function gemKey(product) {
  const gem = `${product.gemstone} ${product.tags?.join(" ")}`.toLowerCase();
  if (gem.includes("ruby")) return "ruby";
  if (gem.includes("emerald")) return "emerald";
  if (gem.includes("sapphire")) return "sapphire";
  if (gem.includes("pearl")) return "pearl";
  if (gem.includes("onyx") || gem.includes("black")) return "black";
  return "diamond";
}

function material(color, name, metalness = 1, roughness = 0.12) {
  return new THREE.MeshStandardMaterial({ name, color, metalness, roughness });
}

function mesh(geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1], name = "mesh") {
  const node = new THREE.Mesh(geometry, mat);
  node.name = name;
  node.position.set(...position);
  node.rotation.set(...rotation);
  node.scale.set(...scale);
  node.castShadow = true;
  node.receiveShadow = true;
  return node;
}

function stone(mat, position, scale = 1, name = "diamond_stone") {
  return mesh(new THREE.OctahedronGeometry(0.14, 2), mat, position, [0, 0, Math.PI / 4], [scale, scale, scale], name);
}

function addPave(group, mat, radius, y, count, scale = 0.28, ovalY = 1) {
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    group.add(stone(mat, [Math.cos(angle) * radius, Math.sin(angle) * radius * ovalY + y, 0.16], scale, "pave_diamond"));
  }
}

function createMats(product) {
  const metal = metalKey(product);
  const gem = gemKey(product);
  return {
    metal: material(materialPalette[metal], `polished_${metal}_metal`, 1, 0.1),
    gem: material(materialPalette[gem], `${gem}_stone`, gem === "pearl" ? 0 : 0.05, gem === "diamond" ? 0.02 : 0.12),
    diamond: material(materialPalette.diamond, "diamond_stone", 0, 0.02),
    dark: material(materialPalette.black, "black_onyx", 0.12, 0.08),
  };
}

function makeRing(product) {
  const mats = createMats(product);
  const seed = hash(product.slug);
  const group = new THREE.Group();
  group.name = `${product.slug}_ring`;
  group.rotation.x = Math.PI * 0.17;
  const bandRadius = 0.96 + (seed % 9) * 0.012;
  group.add(mesh(new THREE.TorusGeometry(bandRadius, 0.09 + (seed % 3) * 0.012, 48, 160), mats.metal, [0, -0.04, 0], [0, 0, 0], [1, 1, 1], "gold_band"));
  group.add(mesh(new THREE.BoxGeometry(0.46, 0.14, 0.2), mats.metal, [0, bandRadius, 0.12], [0, 0, 0], [1, 1, 1], "gold_setting"));
  group.add(stone(mats.gem, [0, bandRadius + 0.2, 0.32], 1.1 + (seed % 4) * 0.1, "hero_gemstone"));
  if (product.subCategory?.toLowerCase().includes("halo") || product.tags?.includes("diamond")) {
    addPave(group, mats.diamond, 0.3, bandRadius + 0.2, 14, 0.2);
  }
  addPave(group, mats.diamond, bandRadius, -0.04, 14 + (seed % 10), 0.18);
  return group;
}

function makeNecklace(product) {
  const mats = createMats(product);
  const seed = hash(product.slug);
  const group = new THREE.Group();
  group.name = `${product.slug}_necklace`;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.35, 0.62, 0),
    new THREE.Vector3(-0.7, 0.12, 0.02),
    new THREE.Vector3(0, -0.16, 0),
    new THREE.Vector3(0.7, 0.12, 0.02),
    new THREE.Vector3(1.35, 0.62, 0),
  ]);
  group.add(mesh(new THREE.TubeGeometry(curve, 80, 0.028 + (seed % 3) * 0.006, 12, false), mats.metal, [0, 0, 0], [0, 0, 0], [1, 1, 1], "chain"));

  if (`${product.gemstone} ${product.name}`.toLowerCase().includes("pearl")) {
    for (let i = 0; i < 19; i += 1) {
      const t = i / 18;
      const angle = Math.PI * (0.14 + t * 0.72);
      const size = 0.09 + Math.sin(t * Math.PI) * 0.035;
      group.add(mesh(new THREE.SphereGeometry(size, 24, 16), mats.gem, [Math.cos(angle) * 1.08, Math.sin(angle) * 0.76 - 0.28, 0.04], [0, 0, 0], [1, 1, 1], "pearl"));
    }
    return group;
  }

  group.add(mesh(new THREE.TorusGeometry(0.32 + (seed % 4) * 0.025, 0.038, 40, 120), mats.metal, [0, -0.42, 0], [0, 0, 0], [1, 1.12, 1], "pendant_frame"));
  group.add(stone(mats.gem, [0, -0.42, 0.16], 1.2 + (seed % 3) * 0.15, "pendant_gem"));
  addPave(group, mats.diamond, 0.34, -0.42, 12 + (seed % 5), 0.16);
  return group;
}

function makeEarrings(product) {
  const mats = createMats(product);
  const seed = hash(product.slug);
  const group = new THREE.Group();
  group.name = `${product.slug}_earrings`;
  const drop = product.subCategory?.toLowerCase().includes("drop") || product.subCategory?.toLowerCase().includes("chandelier") || product.name.toLowerCase().includes("jhumka");
  for (const x of [-0.45, 0.45]) {
    group.add(mesh(new THREE.TorusGeometry(0.2 + (seed % 3) * 0.02, 0.038, 36, 88), mats.metal, [x, 0.28, 0], [0, 0, 0], [1, 1, 1], "earring_top"));
    if (drop) {
      group.add(mesh(new THREE.SphereGeometry(0.22, 32, 22), mats.metal, [x, -0.22, 0], [0, 0, 0], [0.8, 1.2, 0.7], "drop_body"));
      group.add(stone(mats.gem, [x, -0.2, 0.24], 0.78, "drop_gem"));
    } else {
      group.add(mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.08, 36), mats.metal, [x, 0, -0.05], [Math.PI / 2, 0, 0], [1, 1, 1], "stud_base"));
      group.add(stone(mats.gem, [x, 0, 0.14], 1, "stud_gem"));
    }
  }
  return group;
}

function makeBracelet(product) {
  const mats = createMats(product);
  const seed = hash(product.slug);
  const group = new THREE.Group();
  group.name = `${product.slug}_bracelet`;
  group.rotation.x = Math.PI * 0.22;
  const isCuff = `${product.subCategory} ${product.name}`.toLowerCase().includes("cuff") || product.category === "Bangles";
  if (isCuff) {
    group.add(mesh(new THREE.TorusGeometry(0.88, 0.12 + (seed % 4) * 0.02, 56, 160, Math.PI * 1.66), mats.metal, [0, 0, 0], [0, 0, Math.PI * 0.16], [1.28, 0.72, 0.22], "cuff_body"));
    addPave(group, mats.gem, 1.02, 0, 10 + (seed % 8), 0.22, 0.58);
    return group;
  }
  const count = 22 + (seed % 12);
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * 1.08;
    const y = Math.sin(angle) * 0.58;
    group.add(mesh(new THREE.BoxGeometry(0.16, 0.1, 0.1), mats.metal, [x, y, 0], [0, 0, angle], [1, 1, 1], "bracelet_link"));
    if (i % 2 === 0 || product.tags?.includes("diamond")) group.add(stone(mats.gem, [x, y, 0.15], 0.32, "bracelet_gem"));
  }
  return group;
}

function makeChain(product) {
  const mats = createMats(product);
  const group = new THREE.Group();
  group.name = `${product.slug}_chain`;
  for (let i = 0; i < 26; i += 1) {
    const x = (i - 12.5) * 0.09;
    const y = Math.sin(i * 0.55) * 0.08;
    group.add(mesh(new THREE.TorusGeometry(0.09, 0.018, 16, 42), mats.metal, [x, y, 0], [Math.PI / 2, 0, i % 2 ? 0 : Math.PI / 2], [1.4, 0.72, 1], "chain_link"));
  }
  return group;
}

function modelFor(product) {
  if (product.category === "Rings" || product.category === "Couple Rings" || product.subCategory?.toLowerCase().includes("ring")) return makeRing(product);
  if (product.category === "Earrings" || product.subCategory?.toLowerCase().includes("earring") || product.subCategory?.toLowerCase().includes("jhumka")) return makeEarrings(product);
  if (product.category === "Bracelets" || product.category === "Bangles" || product.subCategory?.toLowerCase().includes("bracelet") || product.subCategory?.toLowerCase().includes("bangle") || product.subCategory?.toLowerCase().includes("kada")) return makeBracelet(product);
  if (product.category === "Chains" || product.subCategory?.toLowerCase().includes("chain")) return makeChain(product);
  return makeNecklace(product);
}

function svgFor(product, variant = "front") {
  const metal = materialPalette[metalKey(product)];
  const gem = materialPalette[gemKey(product)];
  const accent = materialPalette.diamond;
  const title = product.name.replace(/&/g, "and");
  const type = product.category;
  const seed = hash(`${product.slug}-${variant}`);
  const rotate = variant === "angle" ? -12 : variant === "detail" ? 8 : 0;
  const zoom = variant === "detail" ? 1.14 : 1;
  const bg = variant === "detail" ? "#F7F3EC" : "#FBFAF7";

  const shape = (() => {
    if (type.includes("Ring") || product.subCategory?.includes("Ring")) {
      return `<g transform="translate(600 620) rotate(${rotate}) scale(${zoom})">
        <ellipse cx="0" cy="35" rx="260" ry="178" fill="none" stroke="${metal}" stroke-width="54"/>
        <ellipse cx="0" cy="35" rx="190" ry="120" fill="none" stroke="#FFFFFF" stroke-opacity="0.28" stroke-width="10"/>
        <path d="M-80 -142H80L52 -70H-52Z" fill="${metal}"/>
        <polygon points="0,-274 96,-166 46,-82 -46,-82 -96,-166" fill="${gem}"/>
        <circle cx="0" cy="-142" r="${38 + (seed % 16)}" fill="${accent}" fill-opacity="0.82"/>
      </g>`;
    }
    if (type.includes("Earring") || product.subCategory?.includes("Earring") || product.subCategory?.includes("Jhumka")) {
      return `<g transform="translate(600 580) rotate(${rotate}) scale(${zoom})">
        <g transform="translate(-160 0)"><circle cy="-170" r="74" fill="none" stroke="${metal}" stroke-width="34"/><path d="M0 -72C84 10 112 128 0 226C-112 128 -84 10 0 -72Z" fill="${metal}"/><circle cy="68" r="54" fill="${gem}"/></g>
        <g transform="translate(160 0)"><circle cy="-170" r="74" fill="none" stroke="${metal}" stroke-width="34"/><path d="M0 -72C84 10 112 128 0 226C-112 128 -84 10 0 -72Z" fill="${metal}"/><circle cy="68" r="54" fill="${gem}"/></g>
      </g>`;
    }
    if (type.includes("Bracelet") || type.includes("Bangle")) {
      return `<g transform="translate(600 610) rotate(${rotate}) scale(${zoom})">
        <ellipse rx="340" ry="160" fill="none" stroke="${metal}" stroke-width="72"/>
        <ellipse rx="242" ry="96" fill="none" stroke="#FFFFFF" stroke-opacity="0.32" stroke-width="12"/>
        ${Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return `<circle cx="${Math.cos(angle) * 305}" cy="${Math.sin(angle) * 135}" r="24" fill="${gem}"/>`;
        }).join("")}
      </g>`;
    }
    if (type.includes("Chain")) {
      return `<g transform="translate(600 610) rotate(${rotate}) scale(${zoom})">${Array.from({ length: 18 }, (_, i) => {
        const x = (i - 8.5) * 42;
        const y = Math.sin(i * 0.8) * 34;
        return `<ellipse cx="${x}" cy="${y}" rx="45" ry="25" fill="none" stroke="${metal}" stroke-width="18" transform="rotate(${i % 2 ? 25 : -25} ${x} ${y})"/>`;
      }).join("")}</g>`;
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

function toDiskPath(publicPath) {
  return path.join(root, "public", publicPath.replace(/^\//, ""));
}

async function writeSvgSet(product) {
  const [front, angle, detail] = product.gallery;
  for (const [target, variant] of [
    [front, "front"],
    [angle, "angle"],
    [detail, "detail"],
  ]) {
    const filePath = toDiskPath(target);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, svgFor(product, variant));
  }
}

async function writeModel(product) {
  const scene = new THREE.Scene();
  scene.add(modelFor(product));
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

for (const product of PRODUCTS) {
  await writeSvgSet(product);
  await writeModel(product);
}

for (const category of CATEGORIES) {
  const product = PRODUCTS.find((item) => item.image === category.image) || PRODUCTS.find((item) => item.category === category.name);
  if (product) {
    const filePath = toDiskPath(category.image);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, svgFor(product, "front"));
  }
}
