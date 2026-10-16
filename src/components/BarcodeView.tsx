/**
 * BARCODE VIEW — renderowanie kodu kreskowego / QR W CAŁOŚCI OFFLINE.
 * ---------------------------------------------------------------------------
 * Klucz modułu 1 (ekran kasowy): kod musi być wyraźny i działać bez internetu.
 *
 *  - format 'qr'  → biblioteka react-native-qrcode-svg (macierz QR),
 *  - pozostałe    → własny enkoder CODE128-B (patrz utils/barcode.ts) + SVG.
 *
 * CODE128-B potrafi zapisać dowolny numer karty (cyfry, litery). Zapisujemy
 * więc EAN-13 także jako CODE128 — czytniki sklepowe odczytują z niego te same
 * cyfry. Gdy tekst zawiera znaki spoza ASCII (enkoder zwraca null), awaryjnie
 * rysujemy QR, żeby użytkownik nigdy nie został bez kodu.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';
import type { BarcodeFormat } from '@/types';
import { encodeCode128 } from '@/utils/barcode';
import { colors } from '@/theme/colors';

interface BarcodeViewProps {
  value: string;
  format: BarcodeFormat;
  /** Szerokość rysunku (px). */
  width: number;
  /** Wysokość kresek (px). Dla QR szerokość i wysokość są równe. */
  height?: number;
  /** Kolor kodu (domyślnie czarny — maksymalny kontrast). */
  color?: string;
  /** Tło (domyślnie białe — ekran kasowy ma być 100% jasny). */
  background?: string;
}

export function BarcodeView({
  value,
  format,
  width,
  height = 120,
  color = colors.black,
  background = colors.white,
}: BarcodeViewProps) {
  // 1) Prawdziwy QR — jeśli użytkownik tak oznaczył kartę.
  if (format === 'qr') {
    return (
      <View style={[styles.qrWrap, { width, height: width, backgroundColor: background }]}>
        <QRCode value={value} size={width} color={color} backgroundColor={background} ecl="M" />
      </View>
    );
  }

  // 2) Kod kreskowy 1D — próbujemy CODE128.
  const encoded = encodeCode128(value);

  // 2a) Nie da się zakodować (znaki spoza ASCII) → awaryjnie QR.
  if (!encoded) {
    return (
      <View style={[styles.qrWrap, { width, height: width, backgroundColor: background }]}>
        <QRCode value={value} size={width} color={color} backgroundColor={background} ecl="M" />
      </View>
    );
  }

  // 2b) Rysujemy kreski. Szerokość jednego "modułu" skalujemy do zadanej szerokości.
  const moduleWidth = width / encoded.totalModules;
  return (
    <View style={{ width, height, backgroundColor: background }}>
      <Svg width={width} height={height}>
        {encoded.bars.map((bar, index) => (
          <Rect
            key={index}
            x={bar.x * moduleWidth}
            y={0}
            width={bar.width * moduleWidth}
            height={height}
            fill={color}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  qrWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
