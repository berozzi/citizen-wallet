/**
 * DODAWANIE KARTY — /card/new (moduł 1).
 * ---------------------------------------------------------------------------
 * Dwa sposoby wprowadzenia kodu:
 *  1. "Zeskanuj kod z karty" — kamera odczytuje kod kreskowy/QR (najszybsze),
 *  2. ręczne wpisanie numeru.
 *
 * Dodatkowo wybieramy markę z katalogu (kolor + monogram kafelka) albo tworzymy
 * kartę "własną". Zapis tworzy nowy wpis w CardsContext (od razu na kokpicie).
 */
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BarcodeScanner, BarcodeView, Field, PrimaryButton, ScreenContainer, ScreenHeader } from '@/components';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';
import { BRANDS, CUSTOM_BRAND_STYLE, findBrand } from '@/data/brands';
import { useCards } from '@/store/CardsContext';
import { appendScannedBarcode } from '@/storage/barcodeFile';
import type { BarcodeFormat } from '@/types';

/** Zamień typ kodu zwrócony przez kamerę na nasz wewnętrzny format. */
function mapScannedFormat(type: string): BarcodeFormat {
  if (type === 'qr') return 'qr';
  if (type.startsWith('ean') || type.startsWith('upc')) return 'ean13';
  if (type === 'code128') return 'code128';
  return 'code128';
}

const FORMAT_OPTIONS: { value: BarcodeFormat; label: string }[] = [
  { value: 'ean13', label: 'EAN-13' },
  { value: 'code128', label: 'Code 128' },
  { value: 'qr', label: 'QR' },
];

export default function NewCardScreen() {
  const router = useRouter();
  const { addCard } = useCards();

  const [scannerVisible, setScannerVisible] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('ean13');
  const [brandId, setBrandId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [saving, setSaving] = useState(false);

  const brand = useMemo(() => findBrand(brandId), [brandId]);

  /** Wybór marki: ustawiamy domyślne nazwy i kolor kafelka. */
  const selectBrand = (id: string | null) => {
    setBrandId(id);
    const preset = findBrand(id);
    if (preset) {
      setStoreName(preset.name);
      if (!name) setName(preset.name);
    }
  };

  const handleScanned = (data: string, type: string) => {
    setBarcodeValue(data);
    setBarcodeFormat(mapScannedFormat(type));
    setScannerVisible(false);
    // Każdy zeskanowany kod zapisujemy od razu do pliku (barcodes.json/.txt).
    // Zapis jest „w tle" (void) — nie blokuje UI, a błąd tylko logujemy.
    void appendScannedBarcode({
      value: data,
      format: type, // surowy typ zwrócony przez kamerę, np. 'ean13' / 'code128'
      source: 'karta',
      label: storeName.trim() || null,
    });
  };

  // Do zapisu wystarczy sam kod — nazwę i sklep uzupełniamy sensownymi
  // domyślnymi wartościami w handleSave. Wcześniej wymagaliśmy też nazwy/sklepu,
  // przez co przycisk bywał zablokowany i wyglądało to jak "nie da się dodać".
  const canSave = barcodeValue.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const preset = findBrand(brandId);
    await addCard({
      name: name.trim() || storeName.trim() || 'Moja karta',
      storeName: storeName.trim() || 'Sklep',
      brandId,
      color: preset?.color ?? CUSTOM_BRAND_STYLE.color,
      textColor: preset?.textColor ?? CUSTOM_BRAND_STYLE.textColor,
      barcodeValue: barcodeValue.trim(),
      barcodeFormat,
    });
    setSaving(false);
    // Wracamy tam, skąd przyszliśmy. Gdyby nie było historii (np. deep link),
    // otwieramy listę kart, żeby użytkownik zobaczył nową pozycję.
    if (router.canGoBack()) router.back();
    else router.replace('/cards');
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Dodaj kartę" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Skanowanie kodu ---------- */}
        <Text style={styles.sectionTitle}>Kod karty</Text>
        <Pressable style={styles.scanButton} onPress={() => setScannerVisible(true)}>
          <Ionicons name="scan" size={22} color={colors.primary} />
          <Text style={styles.scanButtonText}>
            {barcodeValue ? 'Zeskanuj ponownie' : 'Zeskanuj kod z karty'}
          </Text>
        </Pressable>

        <Field
          label="Numer / treść kodu"
          value={barcodeValue}
          onChangeText={setBarcodeValue}
          placeholder="np. 2401234567890"
          keyboardType="default"
          autoCapitalize="characters"
          hint="Możesz wpisać numer ręcznie, jeśli nie chcesz skanować."
        />

        {/* Podgląd kodu na żywo (gdy coś już wpisano). */}
        {barcodeValue.trim().length > 0 ? (
          <View style={styles.preview}>
            <BarcodeView
              value={barcodeValue.trim()}
              format={barcodeFormat}
              width={Math.min(260, barcodeFormat === 'qr' ? 180 : 260)}
              height={barcodeFormat === 'qr' ? 180 : 90}
            />
          </View>
        ) : null}

        {/* Wybór formatu kodu */}
        <Text style={styles.fieldLabel}>Format kodu</Text>
        <View style={styles.formatRow}>
          {FORMAT_OPTIONS.map((option) => {
            const active = option.value === barcodeFormat;
            return (
              <Pressable
                key={option.value}
                onPress={() => setBarcodeFormat(option.value)}
                style={[styles.formatChip, active && styles.formatChipActive]}
              >
                <Text style={[styles.formatText, active && styles.formatTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ---------- Marka ---------- */}
        <Text style={styles.sectionTitle}>Sklep / marka</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandRow}
        >
          {BRANDS.map((preset) => {
            const active = preset.id === brandId;
            return (
              <Pressable
                key={preset.id}
                onPress={() => selectBrand(preset.id)}
                style={[styles.brandChip, active && styles.brandChipActive]}
              >
                <View style={[styles.brandDot, { backgroundColor: preset.color }]}>
                  <Text style={[styles.brandDotText, { color: preset.textColor }]}>
                    {preset.monogram}
                  </Text>
                </View>
                <Text style={styles.brandChipText}>{preset.name}</Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => selectBrand(null)}
            style={[styles.brandChip, brandId === null && styles.brandChipActive]}
          >
            <View style={[styles.brandDot, { backgroundColor: CUSTOM_BRAND_STYLE.color }]}>
              <Text style={[styles.brandDotText, { color: CUSTOM_BRAND_STYLE.textColor }]}>?</Text>
            </View>
            <Text style={styles.brandChipText}>Własna</Text>
          </Pressable>
        </ScrollView>

        {/* ---------- Nazwy ---------- */}
        <Field
          label="Nazwa sklepu"
          value={storeName}
          onChangeText={setStoreName}
          placeholder="np. Biedronka"
        />
        <Field
          label="Etykieta karty"
          value={name}
          onChangeText={setName}
          placeholder="np. Moja Biedronka"
          hint={brand ? `Marka ${brand.name} — kolor ustawi się automatycznie.` : undefined}
        />

        <PrimaryButton
          label="Zapisz kartę"
          icon="checkmark"
          onPress={handleSave}
          disabled={!canSave}
          loading={saving}
        />
      </ScrollView>

      {/* Nakładka ze skanerem */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Skanowanie kodu</Text>
            <Pressable onPress={() => setScannerVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.scannerWrap}>
            <BarcodeScanner onScanned={handleScanned} style={styles.scanner} />
          </View>
          <Text style={styles.modalHint}>
            Skieruj kamerę na kod kreskowy lub QR na karcie lojalnościowej.
          </Text>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
    marginBottom: spacing.lg,
  },
  scanButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
  },
  preview: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  formatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  formatChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  formatChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  formatText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  formatTextActive: {
    color: colors.primaryDark,
    fontWeight: fontWeight.semibold,
  },
  brandRow: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    paddingRight: spacing.lg,
  },
  brandChip: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  brandChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  brandDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandDotText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  brandChipText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  scannerWrap: {
    height: 360,
  },
  scanner: {
    flex: 1,
  },
  modalHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
