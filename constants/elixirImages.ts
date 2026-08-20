// src/constants/elixirImages.ts
import { ImageSourcePropType } from 'react-native';

const DEFAULT_POTION_IMAGE = { uri: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=500' };

export const ELIXIR_IMAGE_MAP: Record<string, ImageSourcePropType> = {
  skin_01: require('../assets/images/elixir_skin_pearl.png'),
  energy_01: require('../assets/images/elixir_energy_sun.png'),
  diet_01: require('../assets/images/elixir_diet_dark.png'),
  sleep_01: require('../assets/images/elixir_sleep_moon.png'),
  
  // 5번 온전한 조화 엘릭서 매핑 (어떤 키로 들어와도 잡히도록 설정)
  harmony_01: require('../assets/images/elixir_harmony_perfect.png'),
  fatigue_01: require('../assets/images/elixir_harmony_perfect.png'), // 👈 index.tsx에서 fatigue_01을 요청해도 뜨도록 추가
  '5': require('../assets/images/elixir_harmony_perfect.png'),
  'elixir_5': require('../assets/images/elixir_harmony_perfect.png'),
};

export const getElixirImage = (id: string | number): ImageSourcePropType => {
  const key = String(id);
  return ELIXIR_IMAGE_MAP[key] || DEFAULT_POTION_IMAGE;
};