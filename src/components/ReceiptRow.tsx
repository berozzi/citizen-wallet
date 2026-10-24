/**
 * RECEIPT ROW — pojedynczy wiersz na liście paragonów.
 * ---------------------------------------------------------------------------
 * Pokazuje skrót zakupu: ikonę kategorii, sklep, datę, kwotę oraz plakietkę
 * "Gwarancja", gdy paragon jest pilnowany. Cały wiersz jest klikalny.
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import type { Receipt } from '@/types';
import { getCategoryMeta } from '@/data/categories';
import { formatCurrency, formatDate } from '@/utils/dates';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';

interface ReceiptRowProps {
  receipt: Receipt;
  onPress: () => void;
  /** Etykieta plakietki gwarancji (np. "240 dni"). Gdy brak — plakietka się nie pokazuje. */
  warrantyBadge?: string;
}

export function ReceiptRow({ receipt, onPress, warrantyBadge }: ReceiptRowProps) {
  const category = getCategoryMeta(receipt.category);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, { backgroundColor: `${category.color}1A` }]}>
        <Ionicons name={category.icon} size={20} color={category.color} />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.store} numberOfLines={1}>
          {receipt.storeName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta} numberOfLines={1}>
            {formatDate(receipt.date)} · {category.label}
          </Text>
        </View>
        {warrantyBadge ? (
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.primaryDark} />
            <Text style={styles.badgeText}>{warrantyBadge}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.amount}>{formatCurrency(receipt.total)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  store: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryTint,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
});
