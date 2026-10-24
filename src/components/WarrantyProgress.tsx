/**
 * WARRANTY PROGRESS — pasek postępu gwarancji.
 * ---------------------------------------------------------------------------
 * Wizualizuje, ile czasu zostało do końca gwarancji:
 *  - zielony  → ponad 60 dni (spokojnie),
 *  - żółty    → 30–60 dni (warto zerknąć),
 *  - czerwony → mniej niż 30 dni (reaguj!).
 *
 * Kolor paska bierzemy z poziomu (`level`) wyliczonego w ReceiptsContext.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';

interface WarrantyProgressProps {
  remainingPercent: number;
  daysLeft: number;
  level: 'ok' | 'warning' | 'danger';
}

export function WarrantyProgress({ remainingPercent, daysLeft, level }: WarrantyProgressProps) {
  // Normalizacja do zakresu 0–100 (na wypadek drobnych błędów zaokrągleń).
  const percent = Math.max(0, Math.min(100, remainingPercent));
  const barColor = LEVEL_COLORS[level];

  // Czytelny opis czasu: "1 rok 2 mies.", "45 dni", "koniec za 3 dni"...
  const remainingLabel =
    daysLeft < 0
      ? 'Gwarancja wygasła'
      : daysLeft === 0
        ? 'Ostatni dzień gwarancji'
        : `Pozostało ${daysLeft} ${pluralDni(daysLeft)}`;

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.remaining}>{remainingLabel}</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const LEVEL_COLORS = {
  ok: colors.success,
  warning: colors.warning,
  danger: colors.danger,
} as const;

/** Polska odmiana słowa "dzień" dla liczebnika. */
function pluralDni(n: number): string {
  if (n === 1) return 'dzień';
  return 'dni';
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  remaining: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  percent: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
