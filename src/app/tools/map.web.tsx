/**
 * PUNKTY ZBIÓRKI — trasa /tools/map, wersja WEB.
 * ---------------------------------------------------------------------------
 * `react-native-maps` nie ma implementacji web, więc zamiast mapy pokazujemy
 * komunikat zastępczy + działającą listę punktów (wspólny `CollectionPointsScreen`).
 */
import React from 'react';
import { CollectionPointsScreen } from '@/components/CollectionPointsScreen';

export default function MapScreen() {
  return <CollectionPointsScreen />;
}
