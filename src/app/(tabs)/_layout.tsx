/**
 * TABS LAYOUT — dolny pasek nawigacji z 4 zakładkami.
 * ---------------------------------------------------------------------------
 * Kokpit | Karty | Paragony | Narzędzia
 *
 * Używamy klasycznych zakładek JS (`expo-router/js-tabs`), bo dają pełną
 * kontrolę nad kolorem ikon (tint = kolor marki) i wyglądają identycznie na
 * iOS i Androidzie. Nagłówki ukryte — każdy ekran rysuje własny.
 */
import React from 'react';
import { type ColorValue } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, fontWeight } from '@/theme/colors';

/** Fabryka funkcji renderującej ikonę zakładki (wypełniona, gdy aktywna). */
function tabIcon(
  active: React.ComponentProps<typeof Ionicons>['name'],
  inactive: React.ComponentProps<typeof Ionicons>['name']
) {
  // Parametr `color` ma typ `ColorValue` (może być też null/liczba) — taki
  // przekazuje pasek zakładek. My zawsze ustawiamy kolory jako napisy (hex),
  // więc dla pewności przepuszczamy tylko napis, a resztę sprowadzamy do tła.
  // Funkcja jest nazwana (TabBarIcon), dzięki czemu spełnia regułę display-name.
  return function TabBarIcon({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) {
    return (
      <Ionicons
        name={focused ? active : inactive}
        size={size}
        color={typeof color === 'string' ? color : colors.textSecondary}
      />
    );
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs - 1,
          fontWeight: fontWeight.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Kokpit', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="cards"
        options={{ title: 'Karty', tabBarIcon: tabIcon('wallet', 'wallet-outline') }}
      />
      <Tabs.Screen
        name="receipts"
        options={{ title: 'Paragony', tabBarIcon: tabIcon('receipt', 'receipt-outline') }}
      />
      <Tabs.Screen
        name="tools"
        options={{ title: 'Narzędzia', tabBarIcon: tabIcon('construct', 'construct-outline') }}
      />
    </Tabs>
  );
}
