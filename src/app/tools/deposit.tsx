/**
 * EKO-ZWROTY I BUTELKOMATY — /tools/deposit (moduł 3).
 * ---------------------------------------------------------------------------
 * Użytkownik zapisuje kwity kaucyjne z butelkomatów, żeby nie przepadły.
 * Aplikacja:
 *  - planuje przypomnienie 7 dni przed wygaśnięciem kwitu,
 *  - pokazuje łączną kwotę do odebrania i licznik zwróconych butelek
 *    (szacowany z kaucji: 1 butelka = 0,50 zł),
 *  - pozwala zeskanować kod kwitu (QR) lub wpisać go ręcznie.
 */
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarcodeScanner, Field, PrimaryButton, ScreenContainer, ScreenHeader } from '@/components';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';
import {
  DEPOSIT_PER_UNIT_PLN,
  useEco,
  VOUCHER_VALIDITY_MONTHS,
} from '@/store/EcoContext';
import { addMonths, daysUntil, formatCurrency, formatDate, startOfToday } from '@/utils/dates';
import { appendScannedBarcode } from '@/storage/barcodeFile';

export default function DepositScreen() {
  const { vouchers, activeVouchers, pendingValue, bottlesReturned, addVoucher, deleteVoucher } = useEco();

  const [scannerVisible, setScannerVisible] = useState(false);
  const [amountText, setAmountText] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  // Kwit wydany dziś, ważny 12 miesięcy (domyślnie).
  const issuedAt = startOfToday();
  const expiresAt = useMemo(() => addMonths(issuedAt, VOUCHER_VALIDITY_MONTHS), [issuedAt]);

  const parsedAmount = parseFloat(amountText.replace(',', '.'));
  const canSave = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const estimatedBottles = canSave ? Math.round(parsedAmount / DEPOSIT_PER_UNIT_PLN) : 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    await addVoucher({ amount: parsedAmount, issuedAt, expiresAt, code: code.trim() || null });
    setSaving(false);
    setAmountText('');
    setCode('');
    Alert.alert('Dodano kwit', `Zaplanowaliśmy przypomnienie 7 dni przed ${formatDate(expiresAt)}.`);
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Usunąć kwit?', 'Kwota i przypomnienie zostaną usunięte.', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usuń', style: 'destructive', onPress: () => deleteVoucher(id) },
    ]);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Eko-zwroty" subtitle="Kwity z butelkomatów" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Podsumowanie ---------- */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatCurrency(pendingValue)}</Text>
            <Text style={styles.summaryLabel}>do odebrania</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{bottlesReturned}</Text>
            <Text style={styles.summaryLabel}>zwróconych butelek</Text>
          </View>
        </View>

        {/* ---------- Dodawanie kwitu ---------- */}
        <Text style={styles.sectionTitle}>Dodaj kwit</Text>

        <Pressable style={styles.scanButton} onPress={() => setScannerVisible(true)}>
          <Ionicons name="qr-code" size={22} color={colors.primary} />
          <Text style={styles.scanButtonText}>Zeskanuj kod z kwitu</Text>
        </Pressable>

        <Field
          label="Kwota kaucji (zł)"
          value={amountText}
          onChangeText={setAmountText}
          placeholder="np. 12,00"
          keyboardType="decimal-pad"
          hint={
            canSave
              ? `To około ${estimatedBottles} butelek (${DEPOSIT_PER_UNIT_PLN.toFixed(2)} zł/szt.).`
              : 'Kwota z kwitu wydanego przez butelkomat.'
          }
        />

        <Field
          label="Kod kwitu (opcjonalnie)"
          value={code}
          onChangeText={setCode}
          placeholder="np. KAUCJA-2026-0001"
          autoCapitalize="characters"
        />

        <View style={styles.expiryRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.expiryText}>
            Ważny do {formatDate(expiresAt)} ({VOUCHER_VALIDITY_MONTHS} mies.)
          </Text>
        </View>

        <PrimaryButton
          label="Zapisz kwit"
          icon="add"
          onPress={handleSave}
          disabled={!canSave}
          loading={saving}
          style={styles.saveButton}
        />

        {/* ---------- Lista kwitów ---------- */}
        <Text style={styles.sectionTitle}>
          Twoje kwity ({vouchers.length})
        </Text>

        {vouchers.length === 0 ? (
          <Text style={styles.emptyHint}>Nie masz jeszcze żadnego kwitu kaucyjnego.</Text>
        ) : (
          vouchers.map((voucher) => {
            const left = daysUntil(voucher.expiresAt);
            const expired = left < 0;
            const urgent = left >= 0 && left <= 7;
            return (
              <View key={voucher.id} style={styles.voucherCard}>
                <View style={styles.voucherLeft}>
                  <Text style={styles.voucherAmount}>{formatCurrency(voucher.amount)}</Text>
                  <Text style={styles.voucherMeta}>
                    {voucher.code ? `${voucher.code} · ` : ''}
                    ważny do {formatDate(voucher.expiresAt)}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      expired
                        ? styles.badgeDanger
                        : urgent
                          ? styles.badgeWarning
                          : styles.badgeOk,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        expired
                          ? styles.badgeTextDanger
                          : urgent
                            ? styles.badgeTextWarning
                            : styles.badgeTextOk,
                      ]}
                    >
                      {expired ? 'przepadł' : left === 0 ? 'ostatni dzień' : `${left} dni`}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => confirmDelete(voucher.id)}
                  hitSlop={8}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            );
          })
        )}

        {activeVouchers.length === 0 && vouchers.length > 0 ? (
          <Text style={styles.emptyHint}>Wszystkie kwity wygasły.</Text>
        ) : null}
      </ScrollView>

      {/* Nakładka skanera QR */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Skanowanie kwitu</Text>
            <Pressable onPress={() => setScannerVisible(false)} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.scannerWrap}>
            <BarcodeScanner
              onScanned={(data, type) => {
                setCode(data);
                setScannerVisible(false);
                // Kod kwitu również trafia do dziennika plikowego.
                void appendScannedBarcode({
                  value: data,
                  format: type,
                  source: 'kwit',
                  label: null,
                });
              }}
              style={styles.scanner}
            />
          </View>
          <Text style={styles.modalHint}>
            Skieruj kamerę na kod QR z kwitu kaucyjnego. Kwotę wpiszesz ręcznie.
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.primary,
    opacity: 0.25,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primaryDark,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.primaryDark,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
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
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  expiryText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  saveButton: {
    marginBottom: spacing.xl,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  voucherLeft: {
    flex: 1,
  },
  voucherAmount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  voucherMeta: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.sm,
  },
  badgeOk: { backgroundColor: '#E3F5EA' },
  badgeWarning: { backgroundColor: colors.accentTint },
  badgeDanger: { backgroundColor: '#FDE8E8' },
  badgeText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
  },
  badgeTextOk: { color: '#276749' },
  badgeTextWarning: { color: '#9C4221' },
  badgeTextDanger: { color: '#9B2C2C' },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
