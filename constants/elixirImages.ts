import { ImageSourcePropType } from 'react-native';

const DEFAULT_POTION_IMAGE = { uri: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=500' };

export const ELIXIR_IMAGE_MAP: Record<string, ImageSourcePropType> = {
  skin_01: require('../assets/images/elixir_skin_pearl.png'),
  energy_01: require('../assets/images/elixir_energy_sun.png'),
  diet_01: require('../assets/images/elixir_diet_dark.png'),
  sleep_01: require('../assets/images/elixir_sleep_moon.png'),
  
  // ✨ 5번 [전신 회복 / 면역] 온전한 조화 엘릭서 등록
  harmony_01: require('../assets/images/elixir_harmony_perfect.png'),
  '5': require('../assets/images/elixir_harmony_perfect.png'),
  elixir_5: require('../assets/images/elixir_harmony_perfect.png'),
};

export const getElixirImage = (id: string | number): ImageSourcePropType => {
  const key = String(id);
  return ELIXIR_IMAGE_MAP[key] || DEFAULT_POTION_IMAGE;
};