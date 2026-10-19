/**
 * DZIENNIK KODÓW KRESKOWYCH — /tools/barcodes
 * ---------------------------------------------------------------------------
 * Podgląd plików, do których aplikacja zapisuje KAŻDY zeskanowany kod:
 *   - `barcodes.json` (tablica obiektów — do odczytu/deserializacji),
 *   - `barcodes.txt`  (ten sam dziennik w formie tekstowej).
 *
 * Ekran pokazuje dokładne ścieżki plików, liczbę wpisów i listę skanów
 * (najnowsze u góry). Można dziennik odświeżyć, udostępnić jego treść oraz
 * wyczyścić. Lista odświeża się automatycznie po powrocie na ekran
 * (`useFocusEffect`), więc skany z innych ekranów są od razu widoczne.
 */
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { EmptyState, PrimaryButton, ScreenContainer, ScreenHeader } from '@/components';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';
import {
  barcodesFileInfo,
  clearScannedBarcodes,
  readScannedBarcodes,
  type BarcodesFileInfo,
} from '@/storage/barcodeFile';
import type { ScannedBarcode } from '@/types';
import { formatDate, formatTime } from '@/utils/dates';

/** Czytelny opis źródła skanu (pole `source` w pliku). */
const SOURCE_LABELS: Record<string, string> = {
  karta: 'Karta lojalnościowa',
  kwit: 'Kwit kaucyjny',
};

export default function BarcodesScreen() {
  const [entries, setEntries] = useState<ScannedBarcode[]>([]);
  const [info, setInfo] = useState<BarcodesFileInfo | null>(null);
  const [loading, setLoading] = useState(true);

  /** Wczytaj dziennik + informacje o plikach (z odczytem z dysku). */
  const load = useCallback(async () => {
    setLoading(true);
    const list = await readScannedBarcodes();
    setEntries(list);
    setInfo(barcodesFileInfo());
    setLoading(false);
  }, []);

  // Odświeżaj przy każdym wejściu na ekran (skany mogły dojść gdzie indziej).
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleShare = async () => {
    // Dzielimy się tekstową wersją dziennika (bez nowych zależności).
    const text =
      entries.length === 0
        ? '(dziennik jest pusty)'
        : entries
            .slice()
            .reverse()
            .map((e) => `${formatDate(e.scannedAt)} ${formatTime(e.scannedAt)}  ${e.value}`)
            .join('\n');
    try {
      await Share.share({ message: `Citizen Wallet — zeskanowane kody:\n\n${text}` });
    } catch (err) {
      console.warn('[barcodes] Share nie powiódł się:', err);
    }
  };

  const handleClear = () => {
    Alert.alert('Wyczyścić dziennik?', 'Pliki barcodes.json i barcodes.txt zostaną usunięte.', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Wyczyść',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await clearScannedBarcodes();
            await load();
          })();
        },
      },
    ]);
  };

  // Najnowsze skany na górze (w pliku trzymamy kolejność chronologiczną).
  const newestFirst = [...entries].reverse();

  return (
    <ScreenContainer>
      <ScreenHeader title="Kody kreskowe" subtitle="Dziennik zapisany w pliku" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Informacje o plikach ---------- */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="document-text-outline" size={18} color={colors.primaryDark} />
            <Text style={styles.infoTitle}>Pliki dziennika</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{entries.length}</Text>
            </View>
          </View>

          <Text style={styles.fileLabel}>barcodes.json</Text>
          <Text style={styles.filePath} selectable>
            {info?.jsonUri ?? '—'}
          </Text>

          <Text style={styles.fileLabel}>barcodes.txt</Text>
          <Text style={styles.filePath} selectable>
            {info?.txtUri ?? '—'}
          </Text>

          <Text style={styles.infoHint}>
            {info?.jsonExists
              ? `Plik JSON istnieje (${info.jsonSize} B). Każdy skan zapisuje się tu automatycznie.`
              : 'Plik jeszcze nie powstał — pojawi się po pierwszym zeskanowaniu kodu.'}
          </Text>
        </View>

        {/* ---------- Akcje ---------- */}
        <View style={styles.actions}>
          <PrimaryButton
            label="Odśwież"
            icon="refresh"
            variant="secondary"
            onPress={() => void load()}
            loading={loading}
          />
          <PrimaryButton
            label="Udostępnij"
            icon="share-outline"
            variant="secondary"
            onPress={() => void handleShare()}
            disabled={entries.length === 0}
          />
          <PrimaryButton
            label="Wyczyść dziennik"
            icon="trash-outline"
            variant="danger"
            onPress={handleClear}
            disabled={entries.length === 0}
          />
        </View>

        {/* ---------- Lista skanów ---------- */}
        <Text style={styles.sectionTitle}>Zapisane kody</Text>

        {entries.length === 0 ? (
          <EmptyState
            icon="barcode-outline"
            title="Brak zeskanowanych kodów"
            message="Zeskanuj kod karty lojalnościowej albo kwitu kaucyjnego — kod od razu trafi do pliku."
          />
        ) : (
          newestFirst.map((entry) => (
            <Pressable key={entry.id} style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="barcode-outline" size={20} color={colors.primaryDark} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowValue} numberOfLines={1} selectable>
                  {entry.value}
                </Text>
                <Text style={styles.rowMeta}>
                  {SOURCE_LABELS[entry.source] ?? entry.source} · {entry.format} ·{' '}
                  {formatDate(entry.scannedAt)} {formatTime(entry.scannedAt)}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  infoCard: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
  },
  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  fileLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
    marginTop: spacing.sm,
  },
  // Ścieżka bywa długa — łamiemy ją i pozwalamy zaznaczyć do skopiowania.
  filePath: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoHint: {
    fontSize: fontSize.xs,
    color: colors.primaryDark,
    marginTop: spacing.md,
    lineHeight: 16,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  rowMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
