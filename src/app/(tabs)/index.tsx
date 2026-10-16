/**
 * KOKPIT — ekran główny (zakładka "Kokpit").
 * ---------------------------------------------------------------------------
 * To "centrum dowodzenia" aplikacji. Zbiera w jednym miejscu:
 *  - powitanie użytkownika,
 *  - PILNE alerty (kończąca się gwarancja, kwit kaucyjny, wywóz śmieci),
 *  - kafelki statystyk (karty, wydatki, eko, gwarancje),
 *  - najczęściej używane karty (szybki dostęp na kasie),
 *  - skróty do dodawania karty i paragonu.
 *
 * Wszystko liczone jest z lokalnego stanu (Contexty) — zero zapytań do sieci.
 */
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  CardTile,
  AlertBanner,
  PrimaryButton,
  SectionHeader,
  StatTile,
  ScreenContainer,
} from '@/components';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';
import { useCards } from '@/store/CardsContext';
import { useReceipts } from '@/store/ReceiptsContext';
import { useEco } from '@/store/EcoContext';
import { useSettings } from '@/store/SettingsContext';
import { formatCurrency, daysUntil, WEEKDAY_NAMES } from '@/utils/dates';
import { nextPickup } from '@/utils/schedule';
import { WASTE_TYPE_LABELS } from '@/utils/notifications';

export default function DashboardScreen() {
  const router = useRouter();
  const { cards, mostUsedCards } = useCards();
  const { monthlyTotal, warrantyReceipts, getWarrantyStatus } = useReceipts();
  const { bottlesReturned, pendingValue, expiringVouchers } = useEco();
  const { settings } = useSettings();

  // Powitanie zależne od pory dnia.
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Cześć';
    return 'Dobry wieczór';
  }, []);

  const frequentCards = mostUsedCards(3);

  // Najbliższa kończąca się gwarancja (do alertu).
  const soonestWarranty = useMemo(() => {
    if (warrantyReceipts.length === 0) return null;
    const first = warrantyReceipts[0];
    return { receipt: first, status: getWarrantyStatus(first) };
  }, [warrantyReceipts, getWarrantyStatus]);

  // Najbliższy wywóz odpadów (jeśli użytkownik ustawił harmonogram).
  const pickup = useMemo(() => nextPickup(settings.schedule), [settings.schedule]);

  // Pierwszy kwit, który wkrótce wygaśnie.
  const expiring = expiringVouchers[0];

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      {/* ---------- Nagłówek powitalny ---------- */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {greeting}, {settings.userName} 👋
        </Text>
        <Text style={styles.subtitle}>Twój portfel obywatela — wszystko w jednym miejscu.</Text>
      </View>

      {/* ---------- Alerty (pilne sprawy) ---------- */}
      {expiring ? (
        <View style={styles.alertSpacing}>
          <AlertBanner
            tone="warning"
            title="Kwit kaucyjny wkrótce wygaśnie"
            message={`${formatCurrency(expiring.amount)} · ważny jeszcze ${Math.max(
              0,
              daysUntil(expiring.expiresAt)
            )} dni`}
            onPress={() => router.push('/tools/deposit')}
          />
        </View>
      ) : null}

      {soonestWarranty && soonestWarranty.status.daysLeft <= 30 ? (
        <View style={styles.alertSpacing}>
          <AlertBanner
            tone={soonestWarranty.status.daysLeft < 0 ? 'danger' : 'warning'}
            title={
              soonestWarranty.status.daysLeft < 0
                ? 'Gwarancja wygasła'
                : 'Kończy się gwarancja'
            }
            message={`${soonestWarranty.receipt.itemName || soonestWarranty.receipt.storeName}${
              soonestWarranty.status.daysLeft >= 0
                ? ` · pozostało ${soonestWarranty.status.daysLeft} dni`
                : ''
            }`}
            onPress={() => router.push('/receipts')}
          />
        </View>
      ) : null}

      {pickup ? (
        <View style={styles.alertSpacing}>
          <AlertBanner
            tone="info"
            icon="trash-bin"
            title={
              pickup.daysAhead === 0
                ? 'Dziś wywóz odpadów'
                : pickup.daysAhead === 1
                  ? 'Jutro wywóz odpadów'
                  : `Wywóz: ${WEEKDAY_NAMES[pickup.entry.weekday]}`
            }
            message={`${WASTE_TYPE_LABELS[pickup.entry.wasteType]} · wystaw pojemniki wieczorem`}
            onPress={() => router.push('/tools/schedule')}
          />
        </View>
      ) : null}

      {/* ---------- Statystyki ---------- */}
      <View style={styles.statsRow}>
        <StatTile icon="wallet" label="Karty lojalnościowe" value={String(cards.length)} />
        <StatTile
          icon="cash"
          label="Wydatki w tym miesiącu"
          value={formatCurrency(monthlyTotal())}
          tone="accent"
        />
      </View>
      <View style={styles.statsRow}>
        <StatTile
          icon="leaf"
          label="Zwrócone butelki"
          value={String(bottlesReturned)}
          tone="success"
        />
        <StatTile
          icon="shield-checkmark"
          label="Pilnowane gwarancje"
          value={String(warrantyReceipts.length)}
          tone="neutral"
        />
      </View>

      {/* Kaucja do odebrania — subtelna informacja, gdy coś czeka. */}
      {pendingValue > 0 ? (
        <Pressable style={styles.depositCard} onPress={() => router.push('/tools/deposit')}>
          <Ionicons name="reload-circle" size={22} color={colors.primaryDark} />
          <Text style={styles.depositText}>
            Do odebrania z butelkomatów: <Text style={styles.depositValue}>{formatCurrency(pendingValue)}</Text>
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.primaryDark} />
        </Pressable>
      ) : null}

      {/* ---------- Najczęściej używane karty ---------- */}
      <SectionHeader
        title="Używane najczęściej"
        actionLabel="Wszystkie"
        onActionPress={() => router.push('/cards')}
      />
      <View style={styles.list}>
        {frequentCards.length > 0 ? (
          frequentCards.map((card) => (
            <CardTile
              key={card.id}
              card={card}
              variant="list"
              onPress={() => router.push({ pathname: '/card/[id]', params: { id: card.id } })}
            />
          ))
        ) : (
          <Text style={styles.emptyHint}>Nie masz jeszcze żadnej karty — dodaj pierwszą.</Text>
        )}
      </View>

      {/* ---------- Szybkie akcje ---------- */}
      <SectionHeader title="Szybkie akcje" />
      <View style={styles.actionsRow}>
        <PrimaryButton
          label="Dodaj kartę"
          icon="add"
          onPress={() => router.push('/card/new')}
          style={styles.actionButton}
        />
        <PrimaryButton
          label="Dodaj paragon"
          icon="camera"
          variant="secondary"
          onPress={() => router.push('/receipt/new')}
          style={styles.actionButton}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  alertSpacing: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  depositCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryTint,
  },
  depositText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primaryDark,
  },
  depositValue: {
    fontWeight: fontWeight.bold,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
