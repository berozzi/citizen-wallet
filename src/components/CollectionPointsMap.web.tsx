/**
 * MAPA PUNKTÓW ZBIÓRKI — wersja WEB (zastępcza).
 * ---------------------------------------------------------------------------
 * `react-native-maps` nie ma implementacji web: jego kod odwołuje się do
 * wewnętrznych mechanizmów React Native (m.in. `codegenNativeCommands`), które
 * na web nie istnieją. Bez tego pliku `expo export --platform web` albo kończy
 * się błędem (jak w SDK 54), albo wciąga cały `react-native-maps` do bundla web
 * (jeden bundle w SDK 57), co grozi wywaleniem się aplikacji przy starcie.
 *
 * Trasa `tools/map` to de facto DWA pliki: `map.tsx` i `map.web.tsx`, a Expo
 * Router przez `require.context` pakuje je OBA do bundla web. Dlatego import
 * `@/components/CollectionPointsMap` z `map.tsx` musi mieć wersję web — Metro
 * rozwiązuje go właśnie na ten plik (`.web.tsx`) i `react-native-maps` nigdy nie
 * trafia na web.
 *
 * W praktyce trasę na web obsługuje `map.web.tsx` (nie przekazuje `renderMap`,
 * więc ten komponent zwykle się nie renderuje) — mimo to pokazuje sensowny
 * komunikat, gdyby kolejność rozwiązywania się zmieniła.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '@/theme/colors';

export function CollectionPointsMap() {
  return (
    <View style={styles.wrap}>
      <Ionicons name="map-outline" size={26} color={colors.textSecondary} />
      <Text style={styles.text}>
        Mapa jest dostępna w aplikacji mobilnej. Poniżej znajdziesz tę samą listę punktów —
        dotknij punktu, aby wyznaczyć trasę.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Kontener (`mapWrap` w CollectionPointsScreen) ma stałą wysokość 260 px.
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
