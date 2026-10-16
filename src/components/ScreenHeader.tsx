/**
 * SCREEN HEADER — własny nagłówek ekranu (zamiast natywnego).
 * ---------------------------------------------------------------------------
 * Rysujemy go sami, żeby mieć pełną kontrolę nad typografią i kolorami
 * (natywne nagłówki ciężko dopasować do design systemu). Zawiera opcjonalny
 * przycisk "wstecz", tytuł/podtytuł oraz slot na akcję po prawej stronie.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, fontWeight, spacing } from '@/theme/colors';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Czy pokazać strzałkę "wstecz". Domyślnie tak. */
  showBack?: boolean;
  /** Własna akcja po prawej (np. ikona kosza / edycji). */
  right?: React.ReactNode;
  /** Własna obsługa przycisku wstecz (domyślnie router.back()). */
  onBack?: () => void;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  right,
  onBack,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack =
    onBack ??
    (() => {
      // Bezpieczny powrót: jeśli jest historia — cofamy, inaczej wracamy na start.
      if (router.canGoBack()) router.back();
      else router.replace('/');
    });

  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable onPress={handleBack} hitSlop={10} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}

      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightSlot}>{right ?? <View style={styles.iconButton} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightSlot: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
