/**
 * KALENDARZ OBYWATELSKI — /tools/schedule (moduł 4).
 * ---------------------------------------------------------------------------
 * Użytkownik przypisuje każdą frakcję odpadów do dnia tygodnia, a aplikacja:
 *  - zapisuje harmonogram lokalnie,
 *  - planuje cotygodniowe przypomnienie o 20:00 w DNIU wywozu (czyli wieczór
 *    przed porannym odbiorem) — zgodnie z wymaganiem dokumentacji.
 *
 * Przypomnienia można włączać/wyłączać jednym przełącznikiem.
 */
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Field, PrimaryButton, ScreenContainer, ScreenHeader } from '@/components';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';
import { useSettings } from '@/store/SettingsContext';
import { ensurePermissionsAsync, WASTE_TYPE_LABELS } from '@/utils/notifications';
import type { WasteScheduleEntry, WasteType } from '@/types';

/** Kolejność frakcji w UI. */
const WASTE_TYPES: WasteType[] = ['zmieszane', 'papier', 'plastik_bio', 'szklo', 'wielkogabarytowe'];

/** Krótkie etykiety dni (kolejność Pon → Ndz). */
const WEEKDAY_SHORT: Record<number, string> = {
  1: 'Pon',
  2: 'Wt',
  3: 'Śr',
  4: 'Czw',
  5: 'Pt',
  6: 'Sob',
  0: 'Ndz',
};
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Pełne nazwy dni (0 = niedziela) do podpisu wybranej wartości. */
const WEEKDAY_LONG: Record<number, string> = {
  0: 'niedziela',
  1: 'poniedziałek',
  2: 'wtorek',
  3: 'środa',
  4: 'czwartek',
  5: 'piątek',
  6: 'sobota',
};

type WeekdayMap = Record<WasteType, number | null>;

/** Zbuduj mapę "frakcja → dzień" z zapisanego harmonogramu. */
function toWeekdayMap(schedule: WasteScheduleEntry[]): WeekdayMap {
  const map = {} as WeekdayMap;
  for (const type of WASTE_TYPES) {
    const entry = schedule.find((e) => e.wasteType === type);
    map[type] = entry ? entry.weekday : null;
  }
  return map;
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { settings, saveSchedule } = useSettings();

  const [address, setAddress] = useState(settings.address);
  const [remindersEnabled, setRemindersEnabled] = useState(settings.wasteRemindersEnabled);
  const [weekdays, setWeekdays] = useState<WeekdayMap>(() => toWeekdayMap(settings.schedule));
  const [saving, setSaving] = useState(false);

  // Podgląd: ile frakcji ma przypisany dzień.
  const assignedCount = useMemo(
    () => WASTE_TYPES.filter((type) => weekdays[type] !== null).length,
    [weekdays]
  );

  /** Ustaw dzień dla frakcji (ponowne dotknięcie tego samego dnia = wyczyść). */
  const setWeekday = (type: WasteType, weekday: number) => {
    setWeekdays((prev) => ({ ...prev, [type]: prev[type] === weekday ? null : weekday }));
  };

  const handleSave = async () => {
    setSaving(true);

    // Budujemy listę wpisów tylko dla przypisanych frakcji.
    const entries: WasteScheduleEntry[] = WASTE_TYPES.filter(
      (type) => weekdays[type] !== null
    ).map((type) => ({ wasteType: type, weekday: weekdays[type] as number }));

    // Jeśli użytkownik chce przypomnienia — upewnij się, że mamy zgodę.
    if (remindersEnabled && entries.length > 0) {
      const granted = await ensurePermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Brak zgody na powiadomienia',
          'Harmonogram zostanie zapisany, ale nie będziemy mogli wysyłać przypomnień. Włącz powiadomienia w ustawieniach systemowych.'
        );
      }
    }

    await saveSchedule(address, entries, remindersEnabled);
    setSaving(false);
    Alert.alert('Zapisano', 'Harmonogram wywozu został zaktualizowany.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Wywóz odpadów" subtitle="Harmonogram i przypomnienia" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Adres */}
        <Field
          label="Adres"
          value={address}
          onChangeText={setAddress}
          placeholder="np. ul. Długa 42, Kraków"
        />

        {/* Przełącznik przypomnień */}
        <View style={styles.reminderBox}>
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderTitle}>Przypomnienia wieczorne</Text>
            <Text style={styles.reminderSubtitle}>
              Powiadomienie o 20:00 dzień przed wywozem.
            </Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={setRemindersEnabled}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>

        {/* Przypisanie frakcji do dni */}
        <Text style={styles.sectionTitle}>Kiedy co odbierają?</Text>
        <Text style={styles.sectionHint}>
          Wybierz dzień tygodnia dla każdej frakcji. Dotknij ponownie, aby usunąć.
        </Text>

        {WASTE_TYPES.map((type) => (
          <View key={type} style={styles.typeCard}>
            <View style={styles.typeHeader}>
              <Text style={styles.typeLabel}>{WASTE_TYPE_LABELS[type]}</Text>
              <Text style={styles.typeValue}>
                {weekdays[type] === null ? 'brak' : WEEKDAY_LONG[weekdays[type] as number]}
              </Text>
            </View>
            <View style={styles.daysRow}>
              {WEEKDAY_ORDER.map((day) => {
                const active = weekdays[type] === day;
                return (
                  <Pressable
                    key={day}
                    onPress={() => setWeekday(type, day)}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                  >
                    <Text style={[styles.dayText, active && styles.dayTextActive]}>
                      {WEEKDAY_SHORT[day]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.summaryRow}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.summaryText}>
            Przypisano {assignedCount} z {WASTE_TYPES.length} frakcji.
          </Text>
        </View>

        <PrimaryButton
          label="Zapisz harmonogram"
          icon="checkmark"
          onPress={handleSave}
          disabled={assignedCount === 0 && address.trim().length === 0}
          loading={saving}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

/** Style ekranu. */
const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  reminderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  reminderTextWrap: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  reminderSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  sectionHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  typeCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  typeLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  typeValue: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    fontWeight: fontWeight.medium,
  },
  daysRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dayChip: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  dayTextActive: {
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
