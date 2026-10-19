/**
 * ROOT LAYOUT — punkt startowy aplikacji.
 * ---------------------------------------------------------------------------
 * Jego zadania:
 *  1. Owinąć całość w providery stanu (ustawienia, karty, paragony, eko) —
 *     dzięki temu dane są dostępne na każdym ekranie i przeżywają nawigację.
 *  2. Założyć SafeAreaProvider (odstępy pod notch/pasek).
 *  3. Ustawić globalny pasek statusu.
 *  4. Zdefiniować Stack: grupa zakładek + ekrany szczegółów (poza paskiem).
 *  5. Przy starcie poprosić o zgodę na powiadomienia.
 *
 * Zasada: providery są NAD Stackiem, więc np. licznik eko na kokpicie i ekran
 * kwitów czytają ten sam stan (bez migotania i duplikacji danych).
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { setupNotificationsAsync } from '@/utils/notifications';
import { CardsProvider } from '@/store/CardsContext';
import { ReceiptsProvider } from '@/store/ReceiptsContext';
import { EcoProvider } from '@/store/EcoContext';
import { SettingsProvider } from '@/store/SettingsContext';

export default function RootLayout() {
  useEffect(() => {
    // Jednorazowo, przy starcie: kanał Android + zgoda na powiadomienia.
    void setupNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <CardsProvider>
          <ReceiptsProvider>
            <EcoProvider>
              {/* Ciemne ikony paska statusu na jasnym tle aplikacji. */}
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false, // własne nagłówki (ScreenHeader)
                  contentStyle: { backgroundColor: colors.background },
                }}
              >
                {/* Dolny pasek zakładek */}
                <Stack.Screen name="(tabs)" />
                {/* Ekrany szczegółów / formularze — otwierane nad zakładkami */}
                <Stack.Screen name="card/new" options={{ presentation: 'modal' }} />
                <Stack.Screen
                  name="card/[id]"
                  options={{ presentation: 'fullScreenModal', animation: 'fade' }}
                />
                <Stack.Screen name="receipt/new" options={{ presentation: 'modal' }} />
                <Stack.Screen name="receipt/[id]" />
                <Stack.Screen name="tools/map" />
                <Stack.Screen name="tools/schedule" />
                <Stack.Screen name="tools/deposit" />
                <Stack.Screen name="tools/barcodes" />
              </Stack>
            </EcoProvider>
          </ReceiptsProvider>
        </CardsProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
