/**
 * PRIMARY BUTTON — jeden przycisk, cztery warianty.
 * ---------------------------------------------------------------------------
 * Warianty:
 *  - primary   → pełny kolor marki (główna akcja, np. "Dodaj kartę"),
 *  - secondary → jasny tint z obramowaniem (akcje drugorzędne),
 *  - ghost     → bez tła (akcje tekstowe),
 *  - danger    → czerwień (usuwanie).
 *
 * Obsługuje stan `disabled` i `loading` (spinner zamiast etykiety).
 */
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Nazwa ikony Ionicons wyświetlanej przed etykietą. */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Rozciągnij na całą szerokość (domyślnie true). */
  fullWidth?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  style,
  fullWidth = true,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const palette = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        { backgroundColor: palette.background, borderColor: palette.border },
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={18} color={palette.text} /> : null}
          <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Definicje kolorów dla wariantów. */
const VARIANTS: Record<
  ButtonVariant,
  { background: string; border: string; text: string }
> = {
  primary: {
    background: colors.primary,
    border: colors.primary,
    text: colors.white,
  },
  secondary: {
    background: colors.primaryTint,
    border: colors.primaryTint,
    text: colors.primaryDark,
  },
  ghost: {
    background: 'transparent',
    border: 'transparent',
    text: colors.primary,
  },
  danger: {
    background: colors.danger,
    border: colors.danger,
    text: colors.white,
  },
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
