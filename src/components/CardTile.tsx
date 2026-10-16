/**
 * CARD TILE — kafelek karty lojalnościowej.
 * ---------------------------------------------------------------------------
 * Dwa warianty:
 *  - "grid" → duży kwadrat na siatkę (kolor marki, monogram, nazwa),
 *  - "list" → poziomy wiersz (np. sekcja "Używane najczęściej").
 *
 * Kolor tła i kolor tekstu pochodzą z danych karty (z katalogu marek), więc
 * każda karta wygląda jak "swoja" — zgodnie z designem aplikacji.
 */
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LoyaltyCard } from '@/types';
import { findBrand, CUSTOM_BRAND_STYLE } from '@/data/brands';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/theme/colors';

interface CardTileProps {
  card: LoyaltyCard;
  variant?: 'grid' | 'list';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function CardTile({ card, variant = 'grid', onPress, style }: CardTileProps) {
  // Monogram: z katalogu marek; dla kart "własnych" bierzemy pierwszą literę nazwy.
  const brand = findBrand(card.brandId);
  const monogram = brand?.monogram ?? card.storeName.charAt(0).toUpperCase();
  const background = card.color || CUSTOM_BRAND_STYLE.color;
  const foreground = card.textColor || CUSTOM_BRAND_STYLE.textColor;

  if (variant === 'list') {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.listRow, pressed && styles.pressed, style]}>
        <View style={[styles.listMonogram, { backgroundColor: background }]}>
          <Text style={[styles.listMonogramText, { color: foreground }]}>{monogram}</Text>
        </View>
        <View style={styles.listTextWrap}>
          <Text style={styles.listName} numberOfLines={1}>
            {card.name}
          </Text>
          <Text style={styles.listStore} numberOfLines={1}>
            {card.storeName}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.gridTile,
        { backgroundColor: background },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.gridHeader}>
        <Text style={[styles.gridMonogram, { color: foreground }]}>{monogram}</Text>
        <Ionicons name="chevron-forward" size={18} color={foreground} style={styles.gridChevron} />
      </View>
      <View>
        <Text style={[styles.gridName, { color: foreground }]} numberOfLines={1}>
          {card.name}
        </Text>
        <Text style={[styles.gridStore, { color: foreground }]} numberOfLines={1}>
          {card.storeName}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  // --- worek "grid" ---
  gridTile: {
    flex: 1,
    minHeight: 120,
    borderRadius: radius.lg,
    padding: spacing.lg,
    justifyContent: 'space-between',
    ...shadow.card,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  gridMonogram: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  gridChevron: {
    opacity: 0.7,
  },
  gridName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  gridStore: {
    fontSize: fontSize.xs,
    opacity: 0.85,
    marginTop: 2,
  },
  // --- wariant "list" ---
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  listMonogram: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listMonogramText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  listTextWrap: {
    flex: 1,
  },
  listName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  listStore: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
