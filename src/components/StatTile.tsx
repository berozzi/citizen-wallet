/**
 * STAT TILE — mały kafelek ze statystyką (kokpit).
 * ---------------------------------------------------------------------------
 * Pokazuje jedną liczbę (np. "12 kart", "249 zł w tym miesiącu") z ikoną
 * i opisem. Kolorystyka ikony zależy od `tone`.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/theme/colors';

type Tone = 'primary' | 'accent' | 'success' | 'neutral';

interface StatTileProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  tone?: Tone;
}

export function StatTile({ icon, label, value, tone = 'primary' }: StatTileProps) {
  const tint = TONES[tone];
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: tint.background }]}>
        <Ionicons name={icon} size={20} color={tint.foreground} />
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const TONES: Record<Tone, { background: string; foreground: string }> = {
  primary: { background: colors.primaryTint, foreground: colors.primaryDark },
  accent: { background: colors.accentTint, foreground: colors.accent },
  success: { background: '#E3F5EA', foreground: colors.success },
  neutral: { background: colors.surface, foreground: colors.textSecondary },
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
