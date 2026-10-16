/**
 * SZCZEGÓŁY PARAGONU — /receipt/[id] (moduł 2).
 * ---------------------------------------------------------------------------
 * Pokazuje pełne dane zakupu, zdjęcie paragonu oraz (jeśli jest) status
 * gwarancji z paskiem postępu. Pozwala też usunąć paragon — wtedy Context
 * sam anuluje zaplanowane powiadomienie i usunie trwałe zdjęcie z dysku.
 */
import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PrimaryButton, ScreenContainer, ScreenHeader, WarrantyProgress } from '@/components';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';
import { getCategoryMeta } from '@/data/categories';
import { useReceipts } from '@/store/ReceiptsContext';
import { formatCurrency, formatDate } from '@/utils/dates';

export default function ReceiptDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getReceipt, getWarrantyStatus, deleteReceipt } = useReceipts();

  const receipt = getReceipt(id);

  if (!receipt) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Paragon" />
        <View style={styles.centered}>
          <Text style={styles.missing}>Nie znaleziono paragonu.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const category = getCategoryMeta(receipt.category);
  const status = receipt.warranty ? getWarrantyStatus(receipt) : null;

  const confirmDelete = () => {
    Alert.alert('Usunąć paragon?', 'Tej operacji nie można cofnąć.', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          await deleteReceipt(receipt.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Szczegóły paragonu"
        right={
          <Pressable onPress={confirmDelete} hitSlop={8} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ---------- Kwota główna ---------- */}
        <View style={styles.heroCard}>
          <View style={[styles.categoryIcon, { backgroundColor: `${category.color}1A` }]}>
            <Ionicons name={category.icon} size={24} color={category.color} />
          </View>
          <Text style={styles.total}>{formatCurrency(receipt.total)}</Text>
          <Text style={styles.store}>{receipt.storeName}</Text>
          <Text style={styles.date}>
            {formatDate(receipt.date)} · {category.label}
          </Text>
        </View>

        {/* ---------- Zdjęcie paragonu ---------- */}
        {receipt.photoUri ? (
          <Image source={{ uri: receipt.photoUri }} style={styles.photo} resizeMode="cover" />
        ) : null}

        {/* ---------- Produkt / notatki ---------- */}
        {receipt.itemName ? (
          <InfoRow icon="cube-outline" label="Produkt" value={receipt.itemName} />
        ) : null}
        {receipt.notes ? (
          <InfoRow icon="document-text-outline" label="Notatki" value={receipt.notes} />
        ) : null}

        {/* ---------- Gwarancja ---------- */}
        {receipt.warranty && status ? (
          <View style={styles.warrantyCard}>
            <View style={styles.warrantyTitleRow}>
              <Ionicons name="shield-checkmark" size={20} color={colors.primaryDark} />
              <Text style={styles.warrantyTitle}>Gwarancja</Text>
            </View>
            <Text style={styles.warrantySubtitle}>
              {receipt.warranty.months} mies. · koniec {formatDate(receipt.warranty.endDate)}
            </Text>
            <View style={styles.progressSpacing}>
              <WarrantyProgress
                remainingPercent={status.remainingPercent}
                daysLeft={status.daysLeft}
                level={status.level}
              />
            </View>
            <View style={styles.notificationNote}>
              <Ionicons name="notifications-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.notificationText}>
                {receipt.warranty.notificationId
                  ? 'Przypomnienie zaplanowane na 30 dni przed końcem.'
                  : 'Przypomnienie nie zostało zaplanowane.'}
              </Text>
            </View>
          </View>
        ) : null}

        <PrimaryButton
          label="Usuń paragon"
          variant="danger"
          icon="trash"
          onPress={confirmDelete}
          style={styles.deleteFullButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

/** Prosty wiersz "etykieta → wartość" dla dodatkowych informacji. */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.textSecondary} />
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missing: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  total: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  store: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  photo: {
    width: '100%',
    height: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: 2,
  },
  warrantyCard: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  warrantyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  warrantyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primaryDark,
  },
  warrantySubtitle: {
    fontSize: fontSize.sm,
    color: colors.primaryDark,
    marginTop: spacing.xs,
  },
  progressSpacing: {
    marginTop: spacing.lg,
  },
  notificationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  notificationText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  deleteFullButton: {
    marginTop: spacing.md,
  },
});
