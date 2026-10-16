/**
 * SECTION HEADER — nagłówek sekcji wewnątrz ekranu.
 * ---------------------------------------------------------------------------
 * Używany do rozdzielania treści (np. "Używane najczęściej", "Wszystkie karty").
 * Po prawej stronie można umieścić link-akcję (np. "Zobacz wszystkie").
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '@/theme/colors';

interface SectionHeaderProps {
  title: string;
  /** Opcjonalna etykieta akcji po prawej (np. "Zobacz wszystkie"). */
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  action: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
});
