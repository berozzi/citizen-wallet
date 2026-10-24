/**
 * BARCODE SCANNER — kamera z odczytem kodów (kreskowych i QR).
 * ---------------------------------------------------------------------------
 * Obsługuje całą "ceremonię" skanowania:
 *  1. pyta o zgodę na aparat (useCameraPermissions),
 *  2. pokazuje podgląd z ramką celowniczą,
 *  3. po odczytaniu kodu wywołuje `onScanned` RAZ (blokada na 1,5 s, żeby ten
 *     sam kod nie poleciał kilkanaście razy w ułamku sekundy),
 *  4. daje przycisk latarki (przydaje się przy słabym świetle).
 *
 * Działa w Expo Go i offline — kamera jest lokalna, nic nie idzie do sieci.
 */
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
// W RN 0.86 (SDK 57) alias `StyleSheet.absoluteFillObject` zniknął z typów; dozwolony jest
// `StyleSheet.absoluteFill` (zwykły obiekt pozycji absolutnej, więc można go rozwinąć).
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, type BarcodeType } from 'expo-camera';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/colors';
import { PrimaryButton } from './PrimaryButton';

interface BarcodeScannerProps {
  /** Wywoływane po odczytaniu kodu (data + typ kodu, np. "ean13"). */
  onScanned: (data: string, type: string) => void;
  /** Jakie typy kodów rozpoznawać. Domyślnie wszystkie popularne. */
  barcodeTypes?: BarcodeType[];
  /** Dodatkowy styl kontenera podglądu. */
  style?: object;
}

/** Domyślny zestaw typów kodów używanych w polskich sklepach / kwitach. */
const DEFAULT_BARCODE_TYPES: BarcodeType[] = [
  'ean13',
  'ean8',
  'code128',
  'code39',
  'code93',
  'itf14',
  'upc_a',
  'upc_e',
  'codabar',
  'qr',
  'datamatrix',
  'pdf417',
  'aztec',
];

export function BarcodeScanner({
  onScanned,
  barcodeTypes = DEFAULT_BARCODE_TYPES,
  style,
}: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  // Blokada chroni przed wielokrotnym odczytem tego samego kodu.
  const lockedRef = useRef(false);

  const handleBarcodeScanned = useCallback(
    (result: { data: string; type: string }) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      onScanned(result.data, result.type);
      // Po 1,5 s można znów skanować (np. kolejny produkt).
      setTimeout(() => {
        lockedRef.current = false;
      }, 1500);
    },
    [onScanned]
  );

  // Stan 1: trwa sprawdzanie uprawnień.
  if (!permission) {
    return (
      <View style={[styles.centered, style]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // Stan 2: brak zgody na aparat — prosimy o nią.
  if (!permission.granted) {
    return (
      <View style={[styles.centered, style]}>
        <View style={styles.permIcon}>
          <Ionicons name="camera-outline" size={30} color={colors.primary} />
        </View>
        <Text style={styles.permTitle}>Potrzebujemy aparatu</Text>
        <Text style={styles.permMessage}>
          Aby zeskanować kod karty, kwitu lub paragonu, zezwól aplikacji na dostęp do aparatu.
        </Text>
        <PrimaryButton
          label="Zezwól na aparat"
          icon="camera"
          onPress={requestPermission}
          fullWidth={false}
          style={styles.permButton}
        />
      </View>
    );
  }

  // Stan 3: podgląd kamery z ramką i latarką.
  return (
    <View style={[styles.cameraWrap, style]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Ramka celownicza — pomaga ustawić kod w polu widzenia. */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
      </View>

      {/* Przełącznik latarki. */}
      <Pressable
        onPress={() => setTorch((t) => !t)}
        style={[styles.torchButton, torch && styles.torchButtonActive]}
        hitSlop={8}
      >
        <Ionicons
          name={torch ? 'flash' : 'flash-off'}
          size={20}
          color={torch ? colors.text : colors.white}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  permIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  permTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  permMessage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  permButton: {
    paddingHorizontal: spacing.xl,
  },
  cameraWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: '72%',
    height: '42%',
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
  },
  torchButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  torchButtonActive: {
    backgroundColor: colors.accent,
  },
});
