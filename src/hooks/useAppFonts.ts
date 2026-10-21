import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';

/** Zwraca true, gdy czcionki są gotowe (albo gdy się nie załadowały – wtedy działa font systemowy). */
export function useAppFonts() {
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });
  return loaded || !!error;
}
