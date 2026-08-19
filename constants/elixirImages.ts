import { ImageSourcePropType } from 'react-native';

const DEFAULT_POTION_IMAGE = { uri: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=500' };

export const ELIXIR_IMAGE_MAP: Record<string, ImageSourcePropType> = {
  skin_01: require('../assets/images/elixir_skin_pearl.png'),
  energy_01: require('../assets/images/elixir_energy_sun.png'),
  diet_01: require('../assets/images/elixir_diet_dark.png'),
  sleep_01: require('../assets/images/elixir_sleep_moon.png'),
};

export const getElixirImage = (id: string): ImageSourcePropType => {
  return ELIXIR_IMAGE_MAP[id] || DEFAULT_POTION_IMAGE;
};