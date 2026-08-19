import { ImageSourcePropType } from 'react-native';

export const MATERIAL_IMAGE_MAP: Record<string, ImageSourcePropType> = {
  m1: require('../assets/images/mat_dew_drop.png'),
  m2: require('../assets/images/mat_bouncy_jelly.png'),
  m3: require('../assets/images/mat_golden_lemon.png'),
  m4: require('../assets/images/mat_white_pearl.png'),
  m5: require('../assets/images/mat_vitality_herb.png'),
  m6: require('../assets/images/mat_heart_clockwork.png'),
  m7: require('../assets/images/mat_dragon_horn.png'),
  m8: require('../assets/images/mat_thousand_year_root.png'),
  m9: require('../assets/images/mat_slim_fruit.png'),
  m10: require('../assets/images/mat_green_tea_leaf.png'),
  m11: require('../assets/images/mat_fullness_moss.png'),
  m12: require('../assets/images/mat_banaba_leaf.png'),
  m13: require('../assets/images/mat_calm_herb.png'),
  m14: require('../assets/images/mat_stability_stone.png'),
  m15: require('../assets/images/mat_detox_thistle.png'),
};

export const getMaterialImage = (id: string): ImageSourcePropType | undefined => {
  return MATERIAL_IMAGE_MAP[id];
};