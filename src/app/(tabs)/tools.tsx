/**
 * NARZĘDZIA — zakładka "Narzędzia".
 * ---------------------------------------------------------------------------
 * Hub prowadzący do pozostałych modułów aplikacji:
 *  - Eko-zwroty i butelkomaty (moduł 3): skanowanie kwitów,
 *  - Mapa punktów zbiórki (moduł 3): butelkomaty, PSZOK, elektrośmieci,
 *  - Kalendarz Obywatelski (moduł 4): harmonogram wywozu śmieci,
 *  - Dziennik kodów kreskowych: pliki, do których zapisują się skany.
 *
 * Każdy kafelek pokazuje krótki, dynamiczny status (np. kwota do odebrania),
 * żeby użytkownik od razu wiedział, czy coś go czeka.
 */
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/theme/colors';
import { useEco } from '@/store/EcoContext';
import { useSettings } from '@/store/SettingsContext';
import { formatCurrency } from '@/utils/dates';
import { COLLECTION_POINTS } from '@/data/collectionPoints';
import { readScannedBarcodes } from '@/storage/barcodeFile';

interface ToolCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  badge?: string;
  onPress: () => void;
}

function ToolCard({ icon, title, description, badge, onPress }: ToolCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={24} color={colors.primaryDark} />
      </View>
      <View style={styles.cardTextWrap}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
        {badge ? <Text style={styles.cardBadge}>{badge}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function ToolsScreen() {
  const router = useRouter();
  const { pendingValue, bottlesReturned, activeVouchers } = useEco();
  const { settings } = useSettings();
  const [barcodeCount, setBarcodeCount] = useState(0);

  // Liczba zeskanowanych kodów zapisanych w pliku — odświeżana przy wejściu.
  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const list = await readScannedBarcodes();
        setBarcodeCount(list.length);
      })();
    }, [])
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Narzędzia</Text>
        <Text style={styles.subtitle}>Ekologia i sprawy obywatelskie pod ręką.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <ToolCard
          icon="reload-circle"
          title="Eko-zwroty i butelkomaty"
          description="Skanuj kwity kaucyjne i pilnuj terminu ich ważności."
          badge={
            pendingValue > 0
              ? `${formatCurrency(pendingValue)} do odebrania · ${bottlesReturned} butelek`
              : `${activeVouchers.length} aktywnych kwitów`
          }
          onPress={() => router.push('/tools/deposit')}
        />

        <ToolCard
          icon="map"
          title="Mapa punktów zbiórki"
          description="Znajdź najbliższy butelkomat, PSZOK lub punkt elektrośmieci."
          badge={`${COLLECTION_POINTS.length} punktów w okolicy`}
          onPress={() => router.push('/tools/map')}
        />

        <ToolCard
          icon="calendar"
          title="Kalendarz wywozu śmieci"
          description="Ustaw harmonogram i dostawaj przypomnienie o 20:00 dzień przed."
          badge={
            settings.schedule.length > 0
              ? `${settings.schedule.length} terminów · ${settings.wasteRemindersEnabled ? 'przypomnienia ON' : 'przypomnienia OFF'}`
              : 'Harmonogram nieustawiony'
          }
          onPress={() => router.push('/tools/schedule')}
        />

        <ToolCard
          icon="barcode-outline"
          title="Dziennik kodów kreskowych"
          description="Podglądnij plik z każdym zeskanowanym kodem (JSON i TXT)."
          badge={
            barcodeCount > 0
              ? `${barcodeCount} zapisanych kodów`
              : 'Plik pusty — zeskanuj kod'
          }
          onPress={() => router.push('/tools/barcodes')}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.85,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  cardDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  cardBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
    marginTop: spacing.xs,
  },
});
