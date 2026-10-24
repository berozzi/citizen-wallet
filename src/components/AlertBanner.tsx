/**
 * ALERT BANNER — pasek informacyjny/oSTRZEŻENIOWY.
 * ---------------------------------------------------------------------------
 * Używany na kokpicie do pilnych spraw: kończąca się gwarancja, kwit kaucyjny
 * bliski wygaśnięcia, jutrzejszy wywóz śmieci. Kolor i ikona zależą od `tone`.
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';

type AlertTone = 'info' | 'warning' | 'success' | 'danger';

interface AlertBannerProps {
  tone?: AlertTone;
  title: string;
  message?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Gdy podane, cały banner staje się klikalny (prowadzi do szczegółów). */
  onPress?: () => void;
}

export function AlertBanner({ tone = 'info', title, message, icon, onPress }: AlertBannerProps) {
  const palette = TONES[tone];
  const content = (
    <View style={[styles.wrap, { backgroundColor: palette.background, borderColor: palette.border }]}>
      <Ionicons name={icon ?? palette.icon} size={22} color={palette.foreground} />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: palette.foreground }]}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={palette.foreground} /> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const TONES: Record<
  AlertTone,
  { background: string; border: string; foreground: string; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  info: {
    background: colors.primaryTint,
    border: colors.primaryTint,
    foreground: colors.primaryDark,
    icon: 'information-circle',
  },
  warning: {
    background: colors.accentTint,
    border: colors.accentTint,
    foreground: '#9C4221',
    icon: 'alert-circle',
  },
  success: {
    background: '#E3F5EA',
    border: '#E3F5EA',
    foreground: '#276749',
    icon: 'checkmark-circle',
  },
  danger: {
    background: '#FDE8E8',
    border: '#FDE8E8',
    foreground: '#9B2C2C',
    icon: 'warning',
  },
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  message: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
