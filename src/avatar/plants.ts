import type { ImageSourcePropType } from 'react-native';
import type { PlantStage } from '../types';

export type PlantId = 'tree' | 'floral' | 'cactus';

export const DEFAULT_PLANT: PlantId = 'tree';

export const PLANTS: { id: PlantId; name: string; blurb: string }[] = [
  { id: 'tree', name: 'Tree', blurb: 'Slow and steady' },
  { id: 'floral', name: 'Flower', blurb: 'Blooms at the end' },
  { id: 'cactus', name: 'Cactus', blurb: 'Small but tough' },
];

// Metro needs fixed paths in require(), so every image is listed out.
const IMAGES: Record<PlantId, Record<PlantStage, ImageSourcePropType>> = {
  tree: {
    1: require('../../assets/avatar/tree/stage1.png'),
    2: require('../../assets/avatar/tree/stage2.png'),
    3: require('../../assets/avatar/tree/stage3.png'),
    4: require('../../assets/avatar/tree/stage4.png'),
    5: require('../../assets/avatar/tree/stage5.png'),
  },
  floral: {
    1: require('../../assets/avatar/floral/stage1.png'),
    2: require('../../assets/avatar/floral/stage2.png'),
    3: require('../../assets/avatar/floral/stage3.png'),
    4: require('../../assets/avatar/floral/stage4.png'),
    5: require('../../assets/avatar/floral/stage5.png'),
  },
  cactus: {
    1: require('../../assets/avatar/cactus/stage1.png'),
    2: require('../../assets/avatar/cactus/stage2.png'),
    3: require('../../assets/avatar/cactus/stage3.png'),
    4: require('../../assets/avatar/cactus/stage4.png'),
    5: require('../../assets/avatar/cactus/stage5.png'),
  },
};

export function plantImage(plant: PlantId, stage: PlantStage): ImageSourcePropType {
  return IMAGES[plant][stage];
}

export function isPlantId(value: unknown): value is PlantId {
  return value === 'tree' || value === 'floral' || value === 'cactus';
}
