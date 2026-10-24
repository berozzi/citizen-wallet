import { useFonts } from 'expo-font';
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display';
import { Lora_400Regular, Lora_500Medium, Lora_600SemiBold } from '@expo-google-fonts/lora';

/** Zwraca true, gdy czcionki są gotowe (albo gdy się nie załadowały – wtedy działa font systemowy). */
export function useAppFonts() {
  const [loaded, error] = useFonts({
    DMSerifDisplay_400Regular,
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
  });
  return loaded || !!error;
}
