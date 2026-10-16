/**
 * FIELD — pole formularza z etykietą i opcjonalną podpowiedzią.
 * ---------------------------------------------------------------------------
 * Standaryzuje wygląd wszystkich formularzy w aplikacji (dodawanie karty,
 * paragonu, harmonogramu). Łączy etykietę + TextInput + komunikat błędu.
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';

interface FieldProps extends TextInputProps {
  label: string;
  /** Tekst pomocniczy pod polem (np. format daty). */
  hint?: string;
}

export function Field({ label, hint, style, ...inputProps }: FieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, style]}
        {...inputProps}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.surfaceRaised,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
