/**
 * EKRAN KASOWY KARTY — /card/[id] (serce modułu 1).
 * ---------------------------------------------------------------------------
 * Wymagania z dokumentacji:
 *  - tło W 100% BIAŁE (żeby czytnik sklepu miał maksymalny kontrast),
 *  - kod wyświetlony DUŻO i OSTRO,
 *  - przycisk "Zamknij".
 *
 * Dodatkowo automatycznie ustawiamy jasność ekranu na maksimum (i przywracamy
 * poprzednią wartość przy wyjściu) — to realnie poprawia skuteczność skanowania.
 * Otwarcie karty liczymy jako "użycie na kasie" (napędza sekcję najczęstszych).
 */
import React, { useEffect, useRef } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import * as Brightness from 'expo-brightness';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BarcodeView, PrimaryButton } from '@/components';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';
import { useCards } from '@/store/CardsContext';
import { groupDigits } from '@/utils/barcode';
import { removeScannedBarcodeByValue } from '@/storage/barcodeFile';

export default function CardCheckoutScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCard, markCardUsed, deleteCard } = useCards();

  const card = getCard(id);
  // Zapamiętujemy jasność sprzed wejścia, aby ją przywrócić po wyjściu.
  const previousBrightness = useRef<number | null>(null);

  useEffect(() => {
    // 1) Rozjaśnij ekran do maksimum (odczyt/zapis jasności aplikacji).
    (async () => {
      try {
        previousBrightness.current = await Brightness.getBrightnessAsync();
        await Brightness.setBrightnessAsync(1);
      } catch {
        // Brak wsparcia (np. web) — pomijamy, ekran i tak jest biały.
      }
    })();

    // 2) Odnotuj użycie karty na kasie.
    void markCardUsed(id);

    // 3) Sprzątanie: przywróć poprzednią jasność.
    return () => {
      const prev = previousBrightness.current;
      if (prev != null) {
        Brightness.setBrightnessAsync(prev).catch(() => {});
      }
    };
    // Celowo tylko `id`: markCardUsed zmienia tożsamość po każdej mutacji stanu,
    // a chcemy odpalić efekt dokładnie raz na wejście.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!card) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.notFound}>Nie znaleziono karty.</Text>
        <PrimaryButton label="Zamknij" onPress={() => router.back()} fullWidth={false} />
      </View>
    );
  }

  /** Usunięcie karty z portfela — z potwierdzeniem, bo operacja jest trwała. */
  const confirmDelete = () => {
    Alert.alert('Usunąć kartę?', `Karta „${card.name}" zostanie trwale usunięta z portfela.`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => {
          // Najpierw wracamy (ekran nie mignie stanem "nie znaleziono"),
          // potem usuwamy wpis z kontekstu — lista odświeży się sama.
          router.back();
          void deleteCard(id);
          // Usuwamy też ślad skanu tej karty z barcodes.json/.txt.
          void removeScannedBarcodeByValue(card.barcodeValue);
        },
      },
    ]);
  };

  // Dla QR rysujemy kwadrat (mniejszy), dla kodów 1D — szeroki pasek.
  const isQr = card.barcodeFormat === 'qr';
  const codeWidth = isQr ? Math.min(width - 128, 260) : width - 48;

  return (
    <View style={styles.screen}>
      {/* Nagłówek: nazwa karty + zamknij */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.storeName} numberOfLines={1}>
            {card.storeName}
          </Text>
          <Text style={styles.cardName} numberOfLines={1}>
            {card.name}
          </Text>
        </View>
        <Pressable onPress={() => router.back()} style={styles.closeButton} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>Pokaż ten kod kasjerowi / przyłóż do czytnika</Text>

        {/* Duży, ostry kod — główny element ekranu */}
        <View style={styles.codeCard}>
          <BarcodeView
            value={card.barcodeValue}
            format={card.barcodeFormat}
            width={codeWidth}
            height={isQr ? codeWidth : 150}
          />
        </View>

        {/* Numer karty pogrupowany dla łatwej weryfikacji wzrokowej */}
        <Text style={styles.codeNumber}>{groupDigits(card.barcodeValue)}</Text>

        <View style={styles.brightnessNote}>
          <Ionicons name="sunny" size={16} color={colors.accent} />
          <Text style={styles.brightnessText}>
            Jasność ekranu została zwiększona automatycznie.
          </Text>
        </View>
      </ScrollView>

      {/* Dolny pasek: duży przycisk Zamknij + usuwanie karty */}
      <View style={styles.footer}>
        <PrimaryButton label="Zamknij" onPress={() => router.back()} />
        <PrimaryButton
          label="Usuń kartę"
          icon="trash-outline"
          variant="danger"
          onPress={confirmDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white, // 100% bieli — kontrast dla czytnika
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  notFound: {
    fontSize: fontSize.lg,
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  storeName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  cardName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  codeCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeNumber: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: 2,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  brightnessNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  brightnessText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
});
