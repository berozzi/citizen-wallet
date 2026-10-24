/**
 * PARAGONY I GWARANCJE — zakładka "Paragony" (moduł 2).
 * ---------------------------------------------------------------------------
 * Jeden ekran, dwa widoki przełączane segmentem:
 *  - "Paragony"  → wszystkie zakupy (najnowsze najpierw) + suma miesiąca,
 *  - "Gwarancje" → tylko produkty z pilnowaną gwarancją, z kolorowym paskiem
 *                  postępu (zielony/żółty/czerwony).
 *
 * Przycisk "Dodaj paragon" (FAB) otwiera formularz ze zdjęciem i ręcznym
 * wpisaniem danych (OCR świadomie poza zakresem MVP 1.0).
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  EmptyState,
  ReceiptRow,
  ScreenContainer,
  SegmentedControl,
  WarrantyProgress,
} from '@/components';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/theme/colors';
import { useReceipts } from '@/store/ReceiptsContext';
import { formatCurrency, formatDate } from '@/utils/dates';

type Tab = 'paragony' | 'gwarancje';

export default function ReceiptsScreen() {
  const router = useRouter();
  const { sortedReceipts, warrantyReceipts, monthlyTotal, getWarrantyStatus } = useReceipts();
  const [tab, setTab] = useState<Tab>('paragony');

  return (
    <ScreenContainer style={styles.root}>
      {/* Nagłówek */}
      <View style={styles.header}>
        <Text style={styles.title}>Paragony i Gwarancje</Text>
        <Text style={styles.subtitle}>
          Wydatki w tym miesiącu: <Text style={styles.highlight}>{formatCurrency(monthlyTotal())}</Text>
        </Text>
      </View>

      {/* Przełącznik widoków */}
      <View style={styles.segmentWrap}>
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'paragony', label: `Paragony (${sortedReceipts.length})` },
            { value: 'gwarancje', label: `Gwarancje (${warrantyReceipts.length})` },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- WIDOK: PARAGONY ---------- */}
        {tab === 'paragony' ? (
          sortedReceipts.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="Brak paragonów"
              message="Zrób zdjęcie paragonu i zapisz go, aby mieć porządek w wydatkach oraz pilnować gwarancji."
              actionLabel="Dodaj paragon"
              onActionPress={() => router.push('/receipt/new')}
            />
          ) : (
            sortedReceipts.map((receipt) => {
              const status = receipt.warranty ? getWarrantyStatus(receipt) : null;
              return (
                <ReceiptRow
                  key={receipt.id}
                  receipt={receipt}
                  warrantyBadge={
                    status
                      ? status.daysLeft >= 0
                        ? `${status.daysLeft} dni gwarancji`
                        : 'gwarancja wygasła'
                      : undefined
                  }
                  onPress={() =>
                    router.push({ pathname: '/receipt/[id]', params: { id: receipt.id } })
                  }
                />
              );
            })
          )
        ) : null}

        {/* ---------- WIDOK: GWARANCJE ---------- */}
        {tab === 'gwarancje' ? (
          warrantyReceipts.length === 0 ? (
            <EmptyState
              icon="shield-outline"
              title="Nie pilnujesz jeszcze żadnej gwarancji"
              message="Podczas dodawania paragonu zaznacz czas gwarancji (np. 24 miesiące), a przypomnimy 30 dni przed jej końcem."
              actionLabel="Dodaj paragon"
              onActionPress={() => router.push('/receipt/new')}
            />
          ) : (
            warrantyReceipts.map((receipt) => {
              const status = getWarrantyStatus(receipt);
              return (
                <Pressable
                  key={receipt.id}
                  style={({ pressed }) => [styles.warrantyCard, pressed && styles.pressed]}
                  onPress={() =>
                    router.push({ pathname: '/receipt/[id]', params: { id: receipt.id } })
                  }
                >
                  <View style={styles.warrantyHeader}>
                    <View style={styles.warrantyTextWrap}>
                      <Text style={styles.warrantyItem} numberOfLines={1}>
                        {receipt.itemName || 'Produkt'}
                      </Text>
                      <Text style={styles.warrantyMeta} numberOfLines={1}>
                        {receipt.storeName} · koniec {formatDate(receipt.warranty!.endDate)}
                      </Text>
                    </View>
                    <Text style={styles.warrantyAmount}>{formatCurrency(receipt.total)}</Text>
                  </View>
                  <WarrantyProgress
                    remainingPercent={status.remainingPercent}
                    daysLeft={status.daysLeft}
                    level={status.level}
                  />
                </Pressable>
              );
            })
          )
        ) : null}
      </ScrollView>

      {/* FAB: dodaj paragon */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
        onPress={() => router.push('/receipt/new')}
      >
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.fabLabel}>Dodaj paragon</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  highlight: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  segmentWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  warrantyCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pressed: { opacity: 0.85 },
  warrantyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  warrantyTextWrap: { flex: 1 },
  warrantyItem: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  warrantyMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  warrantyAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    ...shadow.floating,
  },
  fabLabel: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
