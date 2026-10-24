/**
 * EKRAN PUNKTÓW ZBIÓRKI — część WSPÓLNA dla iOS/Android i web (moduł 3).
 * ---------------------------------------------------------------------------
 * Zawiera całą logikę niezależną od platformy:
 *  - pytanie o lokalizację (opcjonalne — brak zgody nie blokuje listy),
 *  - filtrowanie punktów po typie (butelkomat / PSZOK / elektrośmieci),
 *  - sortowanie po odległości od użytkownika,
 *  - listę punktów z możliwością wyznaczenia trasy.
 *
 * Mapę wstawiamy przez `renderMap`. Na platformach natywnych przekazujemy tam
 * `react-native-maps`, a na web pomijamy — bo react-native-maps nie ma wersji
 * web i jego import wywala aplikację w przeglądarce. Wtedy pokazujemy zastępczy
 * komunikat, a lista punktów działa dalej.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { ScreenContainer } from './ScreenContainer';
import { ScreenHeader } from './ScreenHeader';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';
import { COLLECTION_KIND_LABELS, COLLECTION_POINTS } from '@/data/collectionPoints';
import { distanceKm, formatDistance } from '@/utils/geo';
import type { CollectionPoint } from '@/types';

/** Filtr listy: wszystkie typy albo jeden konkretny. */
type Filter = 'all' | CollectionPoint['kind'];

/** Współrzędne geograficzne (własny alias zamiast zależności od react-native-maps). */
export interface UserLatLng {
  latitude: number;
  longitude: number;
}

/**
 * Kolory przypisane do typów punktów — używane zarówno na liście, jak i na
 * mapie (kolor pinezki), dlatego eksportujemy je na zewnątrz.
 */
export const COLLECTION_KIND_COLORS: Record<CollectionPoint['kind'], string> = {
  butelkomat: colors.primary,
  pszok: colors.accent,
  elektrosmieci: '#805AD5',
};

export interface CollectionPointsScreenProps {
  /**
   * Opcjonalny renderer mapy. Podajemy go tylko na platformach natywnych.
   * Gdy go brak (web), w miejscu mapy pokazujemy komunikat zastępczy.
   */
  renderMap?: (ctx: {
    points: CollectionPoint[];
    userLocation: UserLatLng | null;
  }) => React.ReactNode;
}

export function CollectionPointsScreen({ renderMap }: CollectionPointsScreenProps) {
  const [userLocation, setUserLocation] = useState<UserLatLng | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  // Prosimy o lokalizację raz; brak zgody nie blokuje listy (tryb offline).
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    })().catch(() => {
      // Brak lokalizacji/uprawnień — zostajemy przy widoku domyślnym.
    });
  }, []);

  // Filtrowanie + sortowanie po odległości (gdy znamy pozycję użytkownika).
  const points = useMemo(() => {
    const filtered = COLLECTION_POINTS.filter((p) => filter === 'all' || p.kind === filter);
    if (!userLocation) return filtered;
    return [...filtered].sort(
      (a, b) =>
        distanceKm(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude) -
        distanceKm(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude)
    );
  }, [filter, userLocation]);

  const openDirections = (point: CollectionPoint) => {
    const url = Platform.select({
      ios: `maps://app?daddr=${point.latitude},${point.longitude}`,
      android: `geo:${point.latitude},${point.longitude}?q=${point.latitude},${point.longitude}(${encodeURIComponent(point.name)})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`,
    })!;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`
      );
    });
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Punkty zbiórki" subtitle="Butelkomaty, PSZOK, elektrośmieci" />

      {/* Filtry typów punktów */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <FilterChip label="Wszystkie" active={filter === 'all'} onPress={() => setFilter('all')} />
        {(Object.keys(COLLECTION_KIND_LABELS) as CollectionPoint['kind'][]).map((kind) => (
          <FilterChip
            key={kind}
            label={COLLECTION_KIND_LABELS[kind]}
            active={filter === kind}
            color={COLLECTION_KIND_COLORS[kind]}
            onPress={() => setFilter(kind)}
          />
        ))}
      </ScrollView>

      {/* Mapa (natywnie) albo komunikat zastępczy (web). */}
      {renderMap ? (
        <View style={styles.mapWrap}>{renderMap({ points, userLocation })}</View>
      ) : (
        <View style={[styles.mapWrap, styles.mapFallback]}>
          <Ionicons name="map-outline" size={26} color={colors.textSecondary} />
          <Text style={styles.mapFallbackText}>
            Mapa jest dostępna w aplikacji mobilnej. Poniżej znajdziesz tę samą listę punktów —
            dotknij punktu, aby wyznaczyć trasę.
          </Text>
        </View>
      )}

      {/* Lista punktów */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {points.map((point) => {
          const distance = userLocation
            ? formatDistance(
                distanceKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  point.latitude,
                  point.longitude
                )
              )
            : null;
          return (
            <Pressable
              key={point.id}
              style={({ pressed }) => [styles.pointCard, pressed && styles.pressed]}
              onPress={() => openDirections(point)}
            >
              <View
                style={[
                  styles.pointIcon,
                  { backgroundColor: `${COLLECTION_KIND_COLORS[point.kind]}1A` },
                ]}
              >
                <Ionicons
                  name={point.kind === 'butelkomat' ? 'reload-circle' : 'trash-bin'}
                  size={20}
                  color={COLLECTION_KIND_COLORS[point.kind]}
                />
              </View>
              <View style={styles.pointTextWrap}>
                <Text style={styles.pointName} numberOfLines={1}>
                  {point.name}
                </Text>
                <Text style={styles.pointAddress} numberOfLines={1}>
                  {point.address}
                </Text>
                <Text style={styles.pointHours} numberOfLines={1}>
                  <Ionicons name="time-outline" size={12} /> {point.hours}
                </Text>
              </View>
              <View style={styles.pointRight}>
                {distance ? <Text style={styles.distance}>{distance}</Text> : null}
                <Ionicons name="navigate" size={18} color={colors.primary} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

function FilterChip({
  label,
  active,
  color = colors.primary,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && { borderColor: color, backgroundColor: `${color}1A` }]}
    >
      <Text style={[styles.filterText, active && { color, fontWeight: fontWeight.semibold }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  mapWrap: {
    height: 260,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  mapFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  mapFallbackText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  pointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  pointIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointTextWrap: {
    flex: 1,
  },
  pointName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  pointAddress: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pointHours: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pointRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  distance: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
});
