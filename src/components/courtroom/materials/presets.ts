import * as THREE from 'three';
import {
  GeneratedTextureSet,
  generateBrushedMetalTextureSet,
  generateMarbleTextureSet,
  generateMottledSurfaceTextureSet,
  generateWoodGrainTextureSet,
  generateWovenFabricTextureSet,
} from './textureGenerators';

/**
 * The full set of named material presets used across the courtroom scene.
 * Every surface in scene/*.tsx maps to exactly one of these keys — see the
 * wiring plan in the PR/handoff notes for the surface -> key table.
 */
export type MaterialPresetKey =
  // Wood
  | 'woodFloor'
  | 'woodWalnutDark'
  | 'woodMahogany'
  | 'woodEbony'
  // Stone
  | 'marbleColumn'
  // Metal
  | 'brassBrushed'
  | 'brassPolished'
  | 'metalDarkBrushed'
  // Fabric
  | 'fabricCarpetRunner'
  | 'fabricCarpetAisleTan'
  | 'fabricChair'
  | 'fabricFlagStripe'
  | 'fabricFlagNavy'
  // Plaster
  | 'plasterWallCream'
  | 'plasterWallBeige'
  // Misc (flat or lightly mottled — not part of the five headline families,
  // included so every mesh in the scene has an explicit, typed preset)
  | 'foliageLeaf'
  | 'paperWhite'
  | 'glassWindowPane'
  | 'glassWaterClear'
  | 'accentNavy';

function materialFromTextureSet(
  textures: GeneratedTextureSet | null,
  params: THREE.MeshStandardMaterialParameters
): THREE.MeshStandardMaterial {
  if (!textures) {
    // No 2D canvas context available (SSR, jsdom without the optional
    // `canvas` package, or a browser that refused a new context). Fall back
    // to a flat-color material built from the same base params so the scene
    // still renders — and unit tests never crash — with a plausible color.
    return new THREE.MeshStandardMaterial(params);
  }
  return new THREE.MeshStandardMaterial({
    ...params,
    map: textures.map,
    normalMap: textures.normalMap ?? undefined,
    roughnessMap: textures.roughnessMap ?? undefined,
  });
}

// ---------------------------------------------------------------------------
// Plaster is generated ONCE as a neutral, near-white mottled field and then
// reused (same THREE.Texture objects) by two tinted presets — cream and
// beige. This halves the generation cost of the pair versus drawing two
// separate 512x512 canvases, and guarantees the two walls read as "the same
// batch of plaster, different paint" rather than two unrelated textures.
// ---------------------------------------------------------------------------
let neutralPlasterCache: GeneratedTextureSet | null | undefined;
function getNeutralPlasterTextureSet(): GeneratedTextureSet | null {
  if (neutralPlasterCache === undefined) {
    neutralPlasterCache = generateMottledSurfaceTextureSet({
      seed: 501,
      size: 512,
      baseColor: '#f2ede2',
      blotchAmount: 0.045,
      stippleAmount: 0.03,
      repeat: [4, 2],
    });
  }
  return neutralPlasterCache;
}

interface MaterialPresetDefinition {
  build: () => THREE.MeshStandardMaterial;
}

export const MATERIAL_PRESETS: Record<MaterialPresetKey, MaterialPresetDefinition> = {
  // --- Wood -----------------------------------------------------------
  woodFloor: {
    build: () =>
      materialFromTextureSet(
        generateWoodGrainTextureSet({
          seed: 101,
          size: 512,
          darkColor: '#6b4423',
          lightColor: '#e0b378',
          ringFrequency: 16,
          grainDirection: 'horizontal',
          plankSeams: true,
          repeat: [8, 7],
        }),
        { roughness: 0.65, metalness: 0.04 }
      ),
  },
  woodWalnutDark: {
    build: () =>
      materialFromTextureSet(
        generateWoodGrainTextureSet({
          seed: 102,
          size: 320,
          darkColor: '#3d2a17',
          lightColor: '#7a5230',
          ringFrequency: 9,
          grainDirection: 'vertical',
          repeat: [1, 1],
        }),
        { roughness: 0.42, metalness: 0.1 }
      ),
  },
  woodMahogany: {
    build: () =>
      materialFromTextureSet(
        generateWoodGrainTextureSet({
          seed: 103,
          size: 384,
          darkColor: '#5a3110',
          lightColor: '#a8703f',
          ringFrequency: 7,
          grainDirection: 'vertical',
          repeat: [1, 1],
        }),
        { roughness: 0.3, metalness: 0.1 }
      ),
  },
  woodEbony: {
    build: () =>
      materialFromTextureSet(
        generateWoodGrainTextureSet({
          seed: 104,
          size: 320,
          darkColor: '#241509',
          lightColor: '#4d3018',
          ringFrequency: 11,
          grainDirection: 'vertical',
          repeat: [1, 1],
        }),
        { roughness: 0.22, metalness: 0.06 }
      ),
  },

  // --- Stone ------------------------------------------------------------
  marbleColumn: {
    build: () =>
      materialFromTextureSet(
        generateMarbleTextureSet({
          seed: 201,
          size: 512,
          baseColor: '#f5deb3',
          veinColor: '#c9a86a',
          veinFrequency: 6,
          repeat: [1, 4],
        }),
        { roughness: 0.28, metalness: 0.02 }
      ),
  },

  // --- Metal --------------------------------------------------------------
  brassBrushed: {
    build: () =>
      materialFromTextureSet(
        generateBrushedMetalTextureSet({
          seed: 301,
          size: 384,
          baseColor: '#b8860b',
          patinaColor: '#5c6b4f',
          patinaAmount: 0.22,
          streakContrast: 0.14,
          repeat: [1, 1],
        }),
        { roughness: 1, metalness: 0.8 }
      ),
  },
  brassPolished: {
    build: () =>
      materialFromTextureSet(
        generateBrushedMetalTextureSet({
          seed: 302,
          size: 384,
          baseColor: '#daa520',
          patinaColor: '#7a6a3f',
          patinaAmount: 0.1,
          streakContrast: 0.06,
          repeat: [1, 1],
        }),
        { roughness: 1, metalness: 0.85 }
      ),
  },
  metalDarkBrushed: {
    build: () =>
      materialFromTextureSet(
        generateBrushedMetalTextureSet({
          seed: 303,
          size: 256,
          baseColor: '#2c2c2c',
          patinaColor: '#1a1a1a',
          patinaAmount: 0.12,
          streakContrast: 0.1,
          repeat: [1, 1],
        }),
        { roughness: 1, metalness: 0.75 }
      ),
  },

  // --- Fabric ---------------------------------------------------------
  fabricCarpetRunner: {
    build: () =>
      materialFromTextureSet(
        generateWovenFabricTextureSet({
          seed: 401,
          size: 512,
          baseColor: '#8b0000',
          wornColor: '#a8544f',
          threadSize: 7,
          wearAmount: 0.3,
          repeat: [1, 8],
        }),
        { roughness: 1, metalness: 0 }
      ),
  },
  fabricCarpetAisleTan: {
    build: () =>
      materialFromTextureSet(
        generateWovenFabricTextureSet({
          seed: 402,
          size: 512,
          baseColor: '#d2b48c',
          wornColor: '#e8d5b5',
          threadSize: 7,
          wearAmount: 0.25,
          repeat: [1, 5],
        }),
        { roughness: 1, metalness: 0 }
      ),
  },
  fabricChair: {
    build: () =>
      materialFromTextureSet(
        generateWovenFabricTextureSet({
          seed: 403,
          size: 320,
          baseColor: '#5c3a2e',
          wornColor: '#7a5342',
          threadSize: 5,
          wearAmount: 0.2,
          repeat: [1, 1],
        }),
        { roughness: 1, metalness: 0 }
      ),
  },
  fabricFlagStripe: {
    build: () =>
      materialFromTextureSet(
        generateWovenFabricTextureSet({
          seed: 404,
          size: 256,
          baseColor: '#b22234',
          wornColor: '#c96a78',
          threadSize: 3,
          wearAmount: 0.1,
          repeat: [2, 1],
        }),
        { roughness: 1, metalness: 0 }
      ),
  },
  fabricFlagNavy: {
    build: () =>
      materialFromTextureSet(
        generateWovenFabricTextureSet({
          seed: 405,
          size: 256,
          baseColor: '#003f7f',
          wornColor: '#3f6a9c',
          threadSize: 3,
          wearAmount: 0.1,
          repeat: [2, 1],
        }),
        { roughness: 1, metalness: 0 }
      ),
  },

  // --- Plaster (shared neutral texture, tinted via material.color) -------
  plasterWallCream: {
    build: () =>
      materialFromTextureSet(getNeutralPlasterTextureSet(), {
        color: '#fff8dc',
        roughness: 0.92,
        metalness: 0,
      }),
  },
  plasterWallBeige: {
    build: () =>
      materialFromTextureSet(getNeutralPlasterTextureSet(), {
        color: '#f5f5dc',
        roughness: 0.92,
        metalness: 0,
      }),
  },

  // --- Misc ---------------------------------------------------------------
  foliageLeaf: {
    build: () =>
      materialFromTextureSet(
        generateMottledSurfaceTextureSet({
          seed: 601,
          size: 320,
          baseColor: '#228B22',
          blotchAmount: 0.14,
          stippleAmount: 0.07,
          repeat: [1, 1],
        }),
        { roughness: 0.85, metalness: 0 }
      ),
  },
  paperWhite: {
    build: () =>
      materialFromTextureSet(
        generateMottledSurfaceTextureSet({
          seed: 602,
          size: 256,
          baseColor: '#faf8f2',
          blotchAmount: 0.02,
          stippleAmount: 0.02,
          repeat: [1, 1],
        }),
        { roughness: 0.82, metalness: 0 }
      ),
  },
  glassWindowPane: {
    build: () =>
      new THREE.MeshStandardMaterial({
        color: '#e6f3ff',
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0,
      }),
  },
  glassWaterClear: {
    build: () =>
      new THREE.MeshStandardMaterial({
        color: '#e6f3ff',
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0,
      }),
  },
  accentNavy: {
    build: () =>
      new THREE.MeshStandardMaterial({
        color: '#000080',
        roughness: 0.6,
        metalness: 0,
      }),
  },
};

export const MATERIAL_PRESET_KEYS = Object.keys(MATERIAL_PRESETS) as MaterialPresetKey[];
