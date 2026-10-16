/**
 * SCREEN CONTAINER — wspólny "szkielet" ekranu.
 * ---------------------------------------------------------------------------
 * Zapewnia:
 *  - białe tło aplikacji (spójność z design systemem),
 *  - automatyczny odstęp od góry pod pasek statusu / notcha (safe area),
 *  - opcjonalne przewijanie treści.
 *
 * Dzięki temu każdy ekran nie musi powtarzać tych samych ustawień SafeArea.
 */
import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  /** Czy opakować treść w ScrollView (dla dłuższych ekranów/formularzy). */
  scroll?: boolean;
  /** Czy dodać górny odstęp pod pasek statusu. Wyłącz na ekranach pełnoekranowych. */
  topInset?: boolean;
  /** Własny styl kontenera. */
  style?: StyleProp<ViewStyle>;
  /** Styl wnętrza ScrollView (padding itp.). */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Czy pokazać wbudowany wskaźnik przewijania. */
  showsScrollIndicator?: boolean;
}

export function ScreenContainer({
  children,
  scroll = false,
  topInset = true,
  style,
  contentContainerStyle,
  showsScrollIndicator = false,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  // Górny padding łączymy z ewentualnym paddingiem przekazanym przez ekran.
  const paddingTop = topInset ? insets.top : 0;

  if (scroll) {
    return (
      <ScrollView
        style={[styles.root, { paddingTop }, style]}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={showsScrollIndicator}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.root, { paddingTop }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
});
