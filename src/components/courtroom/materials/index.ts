export type { MaterialPresetKey } from './presets';
export { MATERIAL_PRESETS, MATERIAL_PRESET_KEYS } from './presets';
export {
  getSharedCourtroomMaterial,
  createFreshCourtroomMaterial,
  disposeAllCourtroomMaterials,
  debugTextureBudget,
} from './materialFactory';
export {
  useCourtroomMaterials,
  useFreshCourtroomMaterial,
  type CourtroomMaterialMap,
} from './useCourtroomMaterials';
export type { GeneratedTextureSet } from './textureGenerators';
export {
  generateWoodGrainTextureSet,
  generateMarbleTextureSet,
  generateBrushedMetalTextureSet,
  generateWovenFabricTextureSet,
  generateMottledSurfaceTextureSet,
} from './textureGenerators';
