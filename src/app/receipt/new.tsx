/**
 * DODAWANIE PARAGONU — /receipt/new (moduł 2).
 * ---------------------------------------------------------------------------
 * Zgodnie z MVP 1.0: zdjęcie paragonu + RĘCZNE wpisanie danych (bez OCR).
 * Formularz pozwala też włączyć pilnowanie gwarancji — wtedy Context wylicza
 * datę końca i planuje powiadomienie 30 dni przed nią.
 *
 * Zdjęcie trafia do TRWAŁEGO katalogu aplikacji (kopiujemy je z cache), żeby
 * nie zniknęło po restarcie systemu.
 */
import React, { useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Field, PrimaryButton, ScreenContainer, ScreenHeader } from '@/components';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';
import { RECEIPT_CATEGORIES } from '@/data/categories';
import { useReceipts } from '@/store/ReceiptsContext';
import { copyToDocuments } from '@/storage/storage';
import { startOfToday, formatDate, addMonths } from '@/utils/dates';
import type { ReceiptCategory } from '@/types';

const WARRANTY_PRESETS = [12, 24, 36, 60];

export default function NewReceiptScreen() {
  const router = useRouter();
  const { addReceipt } = useReceipts();

  const [storeName, setStoreName] = useState('');
  const [date, setDate] = useState(startOfToday());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [totalText, setTotalText] = useState('');
  const [category, setCategory] = useState<ReceiptCategory>('spozywcze');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [warrantyEnabled, setWarrantyEnabled] = useState(false);
  const [warrantyMonths, setWarrantyMonths] = useState(24);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  /** Zrób zdjęcie paragonu aparatem. */
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Brak dostępu', 'Zezwól aplikacji na korzystanie z aparatu w ustawieniach.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  /** Wybierz zdjęcie z galerii. */
  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Brak dostępu', 'Zezwól aplikacji na dostęp do zdjęć w ustawieniach.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    // Na Androidzie picker sam się zamyka; na iOS zostaje (przycisk "Gotowe").
    if (Platform.OS !== 'ios') setShowDatePicker(false);
    if (event.type === 'set' && selected) setDate(selected.getTime());
  };

  const parsedTotal = parseFloat(totalText.replace(',', '.'));
  const canSave = storeName.trim().length > 0 && !Number.isNaN(parsedTotal) && parsedTotal > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);

    // Kopia zdjęcia w trwałym katalogu (gdy jest zdjęcie).
    let storedPhoto: string | null = null;
    if (photoUri) {
      try {
        const extension = photoUri.split('.').pop()?.split('?')[0] ?? 'jpg';
        storedPhoto = await copyToDocuments(photoUri, `receipt-${Date.now()}.${extension}`);
      } catch (err) {
        console.warn('[receipt/new] Nie udało się zapisać zdjęcia:', err);
      }
    }

    await addReceipt({
      storeName,
      date,
      total: parsedTotal,
      category,
      photoUri: storedPhoto,
      itemName: itemName.trim() || null,
      warrantyMonths: warrantyEnabled ? warrantyMonths : null,
      notes: notes.trim() || null,
    });

    setSaving(false);
    router.back();
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Dodaj paragon" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Zdjęcie paragonu ---------- */}
        <Text style={styles.sectionTitle}>Zdjęcie paragonu (opcjonalnie)</Text>
        {photoUri ? (
          <View style={styles.photoWrap}>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            <Pressable style={styles.photoRemove} onPress={() => setPhotoUri(null)} hitSlop={8}>
              <Ionicons name="trash" size={18} color={colors.white} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.photoActions}>
            <Pressable style={styles.photoButton} onPress={takePhoto}>
              <Ionicons name="camera" size={22} color={colors.primary} />
              <Text style={styles.photoButtonText}>Zrób zdjęcie</Text>
            </Pressable>
            <Pressable style={styles.photoButton} onPress={pickPhoto}>
              <Ionicons name="images" size={22} color={colors.primary} />
              <Text style={styles.photoButtonText}>Z galerii</Text>
            </Pressable>
          </View>
        )}

        {/* ---------- Dane zakupu ---------- */}
        <Field
          label="Sklep"
          value={storeName}
          onChangeText={setStoreName}
          placeholder="np. Biedronka"
          autoCapitalize="words"
        />

        <Text style={styles.fieldLabel}>Data zakupu</Text>
        <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={18} color={colors.textSecondary} />
          <Text style={styles.dateText}>{formatDate(date)}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>
        {showDatePicker ? (
          <DateTimePicker
            value={new Date(date)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={onDateChange}
          />
        ) : null}
        {showDatePicker && Platform.OS === 'ios' ? (
          <PrimaryButton label="Gotowe" variant="ghost" onPress={() => setShowDatePicker(false)} />
        ) : null}

        <View style={styles.gap} />

        <Field
          label="Kwota (zł)"
          value={totalText}
          onChangeText={setTotalText}
          placeholder="np. 132,47"
          keyboardType="decimal-pad"
        />

        {/* ---------- Kategoria ---------- */}
        <Text style={styles.fieldLabel}>Kategoria</Text>
        <View style={styles.categoryWrap}>
          {RECEIPT_CATEGORIES.map((meta) => {
            const active = meta.value === category;
            return (
              <Pressable
                key={meta.value}
                onPress={() => setCategory(meta.value)}
                style={[
                  styles.categoryChip,
                  active && { borderColor: meta.color, backgroundColor: `${meta.color}1A` },
                ]}
              >
                <Ionicons name={meta.icon} size={16} color={meta.color} />
                <Text style={[styles.categoryText, active && { color: meta.color }]}>
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ---------- Gwarancja ---------- */}
        <View style={styles.warrantyBox}>
          <View style={styles.warrantyToggleRow}>
            <View style={styles.warrantyToggleText}>
              <Text style={styles.warrantyTitle}>Pilnuj gwarancji</Text>
              <Text style={styles.warrantySubtitle}>
                Przypomnimy 30 dni przed jej końcem.
              </Text>
            </View>
            <Switch
              value={warrantyEnabled}
              onValueChange={setWarrantyEnabled}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>

          {warrantyEnabled ? (
            <>
              <Field
                label="Produkt objęty gwarancją"
                value={itemName}
                onChangeText={setItemName}
                placeholder="np. Pralka Bosch"
                hint="Nazwa pojawi się w treści powiadomienia."
              />
              <Text style={styles.fieldLabel}>Długość gwarancji</Text>
              <View style={styles.monthsRow}>
                {WARRANTY_PRESETS.map((months) => {
                  const active = months === warrantyMonths;
                  return (
                    <Pressable
                      key={months}
                      onPress={() => setWarrantyMonths(months)}
                      style={[styles.monthChip, active && styles.monthChipActive]}
                    >
                      <Text style={[styles.monthText, active && styles.monthTextActive]}>
                        {months} mies.
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.warrantySummary}>
                <Ionicons name="shield-checkmark" size={16} color={colors.primaryDark} />
                <Text style={styles.warrantySummaryText}>
                  Gwarancja do {formatDate(addMonths(date, warrantyMonths))}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* ---------- Notatki ---------- */}
        <Field
          label="Notatki (opcjonalnie)"
          value={notes}
          onChangeText={setNotes}
          placeholder="np. zakup na raty 0%"
          multiline
          style={styles.notesInput}
        />

        <PrimaryButton
          label="Zapisz paragon"
          icon="checkmark"
          onPress={handleSave}
          disabled={!canSave}
          loading={saving}
        />
      </ScrollView>
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
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  photoWrap: {
    height: 200,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  photoButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceRaised,
  },
  dateText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  gap: {
    height: spacing.sm,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  categoryText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  warrantyBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  warrantyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  warrantyToggleText: {
    flex: 1,
  },
  warrantyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  warrantySubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  monthsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  monthChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  monthChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  monthText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  monthTextActive: {
    color: colors.primaryDark,
    fontWeight: fontWeight.semibold,
  },
  warrantySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  warrantySummaryText: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    fontWeight: fontWeight.medium,
  },
  notesInput: {
    height: 90,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
});
