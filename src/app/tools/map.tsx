/**
 * MAPA PUNKTÓW ZBIÓRKI — trasa /tools/map, wersja NATYWNA (iOS/Android).
 * ---------------------------------------------------------------------------
 * Całą logikę (filtry, lista, lokalizacja) trzyma wspólny `CollectionPointsScreen`,
 * a tutaj dokładamy wyłącznie mapę z `react-native-maps`.
 *
 * Na web trasę obsługuje `map.web.tsx`, ale dzięki `require.context` Expo Router
 * pakuje do bundla web też ten plik — dlatego import `CollectionPointsMap` ma
 * wariant `CollectionPointsMap.web.tsx`, który wycina `react-native-maps`.
 */
import React from 'react';
import { CollectionPointsScreen } from '@/components/CollectionPointsScreen';
import { CollectionPointsMap } from '@/components/CollectionPointsMap';

export default function MapScreen() {
  return (
    <CollectionPointsScreen
      renderMap={({ points, userLocation }) => (
        <CollectionPointsMap points={points} userLocation={userLocation} />
      )}
    />
  );
}
