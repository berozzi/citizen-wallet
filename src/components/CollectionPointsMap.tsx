/**
 * MAPA PUNKTÓW ZBIÓRKI — komponent NATYWNY (tylko iOS/Android).
 * ---------------------------------------------------------------------------
 * Wydzielony, żeby `react-native-maps` nigdy nie trafił do bundle'a web.
 * Importowany przez trasę `tools/map.tsx`. Na web Metro rozwiązuje ten import
 * na `CollectionPointsMap.web.tsx` (pliku z rozszerzeniem platformowym), więc
 * ten plik z `react-native-maps` zostaje wyłącznie w bundlu natywnym.
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '@/theme/colors';
import { COLLECTION_KIND_COLORS, type UserLatLng } from './CollectionPointsScreen';
import type { CollectionPoint } from '@/types';

/** Domyślny widok mapy — centrum na Krakowie, dopóki nie znamy pozycji użytkownika. */
const DEFAULT_REGION = {
  latitude: 50.0614,
  longitude: 19.9368,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

interface CollectionPointsMapProps {
  points: CollectionPoint[];
  userLocation: UserLatLng | null;
}

export function CollectionPointsMap({ points, userLocation }: CollectionPointsMapProps) {
  const mapRef = useRef<MapView>(null);

  // Po ustaleniu pozycji przesuwamy mapę na użytkownika.
  useEffect(() => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 },
        600
      );
    }
  }, [userLocation]);

  return (
    <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={DEFAULT_REGION}>
      {userLocation ? (
        <Marker coordinate={userLocation} title="Twoja lokalizacja" pinColor={colors.accent} />
      ) : null}
      {points.map((point) => (
        <Marker
          key={point.id}
          coordinate={{ latitude: point.latitude, longitude: point.longitude }}
          title={point.name}
          description={point.address}
          pinColor={COLLECTION_KIND_COLORS[point.kind]}
        />
      ))}
    </MapView>
  );
}
