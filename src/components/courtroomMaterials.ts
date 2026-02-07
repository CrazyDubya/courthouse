/**
 * Shared Materials & Procedural Textures for the 3D Courtroom
 *
 * Centralizes all material definitions to avoid duplicate GPU allocations.
 * Each material is created once and reused across all components.
 * Includes procedural textures for wood grain, marble, and fabric.
 */
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Procedural Texture Generators
// ---------------------------------------------------------------------------

function createWoodGrainTexture(
  baseColor: string,
  grainColor: string,
  width = 256,
  height = 256
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Base colour fill
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  // Draw grain lines
  ctx.strokeStyle = grainColor;
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < height; i += 3) {
    ctx.beginPath();
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    const offset = Math.sin(i * 0.04) * 8 + Math.sin(i * 0.12) * 3;
    ctx.moveTo(offset, i);
    ctx.bezierCurveTo(
      width * 0.25 + offset + Math.random() * 10,
      i + Math.random() * 4 - 2,
      width * 0.75 + offset - Math.random() * 10,
      i + Math.random() * 4 - 2,
      width + offset,
      i
    );
    ctx.stroke();
  }

  // Subtle knot circles
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = grainColor;
  for (let k = 0; k < 3; k++) {
    const kx = Math.random() * width;
    const ky = Math.random() * height;
    const kr = 6 + Math.random() * 12;
    ctx.beginPath();
    ctx.arc(kx, ky, kr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createMarbleTexture(width = 256, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Cream base
  ctx.fillStyle = '#F5F0E6';
  ctx.fillRect(0, 0, width, height);

  // Veins
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#B8A88A';
  for (let v = 0; v < 6; v++) {
    ctx.beginPath();
    ctx.lineWidth = 0.5 + Math.random() * 2;
    let x = Math.random() * width;
    let y = 0;
    ctx.moveTo(x, y);
    while (y < height) {
      x += (Math.random() - 0.5) * 20;
      y += 5 + Math.random() * 15;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createFabricTexture(
  color: string,
  width = 128,
  height = 128
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Cross-hatch weave pattern
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < width; i += 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let j = 0; j < height; j += 2) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(width, j);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createCarpetTexture(width = 128, height = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8B0000';
  ctx.fillRect(0, 0, width, height);

  // Subtle fibre noise
  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = Math.random() > 0.5 ? '#660000' : '#AA2020';
    ctx.fillRect(x, y, 1, 1);
  }

  // Ornamental border lines
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#DAA520';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, width - 16, height - 16);
  ctx.strokeRect(12, 12, width - 24, height - 24);

  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 8);
  return tex;
}

// ---------------------------------------------------------------------------
// Shared Textures (lazily created once)
// ---------------------------------------------------------------------------

let _textures: {
  darkWood: THREE.CanvasTexture;
  lightWood: THREE.CanvasTexture;
  benchWood: THREE.CanvasTexture;
  marble: THREE.CanvasTexture;
  fabric: THREE.CanvasTexture;
  carpet: THREE.CanvasTexture;
} | null = null;

function getTextures() {
  if (!_textures) {
    _textures = {
      darkWood: createWoodGrainTexture('#654321', '#3C1A0A'),
      lightWood: createWoodGrainTexture('#8B4513', '#5C2D0E'),
      benchWood: createWoodGrainTexture('#3C2414', '#1E120A'),
      marble: createMarbleTexture(),
      fabric: createFabricTexture('#654321'),
      carpet: createCarpetTexture(),
    };
  }
  return _textures;
}

// ---------------------------------------------------------------------------
// Shared Materials (created once, reused everywhere)
// ---------------------------------------------------------------------------

let _materials: ReturnType<typeof buildMaterials> | null = null;

function buildMaterials() {
  const tex = getTextures();

  return {
    // Wood surfaces
    darkWood: new THREE.MeshStandardMaterial({
      map: tex.darkWood,
      color: 0x654321,
      roughness: 0.35,
      metalness: 0.1,
    }),
    lightWood: new THREE.MeshStandardMaterial({
      map: tex.lightWood,
      color: 0x8b4513,
      roughness: 0.3,
      metalness: 0.1,
    }),
    benchTop: new THREE.MeshStandardMaterial({
      map: tex.benchWood,
      color: 0x3c2414,
      roughness: 0.2,
      metalness: 0.05,
    }),
    chairFabric: new THREE.MeshStandardMaterial({
      map: tex.fabric,
      color: 0x654321,
      roughness: 0.5,
      metalness: 0.05,
    }),

    // Metals
    brassGold: new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      roughness: 0.1,
      metalness: 0.8,
    }),
    darkMetal: new THREE.MeshStandardMaterial({
      color: 0x2c2c2c,
      roughness: 0.1,
      metalness: 0.9,
    }),
    flagPoleGold: new THREE.MeshStandardMaterial({
      color: 0xdaa520,
      roughness: 0.3,
      metalness: 0.5,
    }),

    // Architectural surfaces
    hardwoodFloor: new THREE.MeshStandardMaterial({
      map: tex.lightWood,
      color: 0xdeb887,
      roughness: 0.7,
    }),
    carpetRunner: new THREE.MeshStandardMaterial({
      map: tex.carpet,
      color: 0x8b0000,
      roughness: 0.9,
    }),
    creamWall: new THREE.MeshStandardMaterial({
      color: 0xfff8dc,
      roughness: 0.9,
    }),
    beigeWall: new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      roughness: 0.9,
    }),
    marble: new THREE.MeshStandardMaterial({
      map: tex.marble,
      color: 0xf5deb3,
      roughness: 0.3,
    }),
    columnCapital: new THREE.MeshStandardMaterial({
      color: 0xdaa520,
      roughness: 0.2,
      metalness: 0.3,
    }),

    // Glass / transparent
    windowGlass: new THREE.MeshStandardMaterial({
      color: 0xe6f3ff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
    }),
    waterGlass: new THREE.MeshStandardMaterial({
      color: 0xe6f3ff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
    }),

    // Decorative
    whitePaper: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
    }),
    greenFoliage: new THREE.MeshStandardMaterial({
      color: 0x228b22,
      roughness: 0.8,
    }),
    americanFlag: new THREE.MeshStandardMaterial({
      color: 0xb22234,
      roughness: 0.6,
    }),
    nyFlag: new THREE.MeshStandardMaterial({
      color: 0x003f7f,
      roughness: 0.6,
    }),
    navyBook: new THREE.MeshStandardMaterial({
      color: 0x000080,
      roughness: 0.6,
    }),
    aisleRunner: new THREE.MeshStandardMaterial({
      color: 0xd2b48c,
      roughness: 0.8,
    }),

    // Glow / feedback
    activeGlow: new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.1,
    }),
    activeGlowStrong: new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.15,
    }),
    activeGlowMedium: new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.12,
    }),
  } as const;
}

export function getSharedMaterials() {
  if (!_materials) {
    _materials = buildMaterials();
  }
  return _materials;
}

// ---------------------------------------------------------------------------
// Shared Geometries (created once, reused via <primitive>)
// ---------------------------------------------------------------------------

let _geometries: ReturnType<typeof buildGeometries> | null = null;

function buildGeometries() {
  return {
    // Jury seat parts
    jurySeat: new THREE.BoxGeometry(0.8, 0.1, 0.8),
    juryBackrest: new THREE.BoxGeometry(0.8, 1, 0.1),
    juryGlow: new THREE.BoxGeometry(1, 1.5, 1),

    // Gallery bench
    galleryBench: new THREE.BoxGeometry(12, 0.5, 0.8),
    galleryBackrest: new THREE.BoxGeometry(12, 1.5, 0.2),

    // Table leg
    tableLeg: new THREE.BoxGeometry(0.1, 0.75, 0.1),

    // Window frame
    windowFrame: new THREE.BoxGeometry(0.15, 6.2, 0.2),

    // Small detail box (gavel rest, etc.)
    smallDetail: new THREE.BoxGeometry(0.3, 0.1, 0.3),
  } as const;
}

export function getSharedGeometries() {
  if (!_geometries) {
    _geometries = buildGeometries();
  }
  return _geometries;
}

// ---------------------------------------------------------------------------
// Cleanup (call when unmounting the 3D scene)
// ---------------------------------------------------------------------------

export function disposeSharedResources() {
  if (_materials) {
    Object.values(_materials).forEach((mat) => mat.dispose());
    _materials = null;
  }
  if (_textures) {
    Object.values(_textures).forEach((tex) => tex.dispose());
    _textures = null;
  }
  if (_geometries) {
    Object.values(_geometries).forEach((geo) => geo.dispose());
    _geometries = null;
  }
}
