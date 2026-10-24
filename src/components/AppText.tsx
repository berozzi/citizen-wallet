import { ComponentProps } from 'react';
import { StyleSheet, Text as RNText, TextInput as RNTextInput, type TextProps } from 'react-native';
import { fonts } from '@/theme/colors';

// Na telefonie `fontWeight` nie zmienia własnej czcionki, więc przeliczamy
// wagę ze stylu na odpowiednią rodzinę (Lora).
function weightOf(w: unknown): number {
  if (w === 'bold') return 700;
  if (w === 'normal' || w == null) return 400;
  const n = Number(w);
  return Number.isFinite(n) ? n : 400;
}

function familyFor(weight: number) {
  if (weight >= 600) return fonts.semibold;
  if (weight >= 500) return fonts.medium;
  return fonts.regular;
}

/**
 * Zamiennik <Text> z czcionką szeryfową.
 * Duże, pogrubione napisy (rozmiar ≥ 22 i waga ≥ 600 – nagłówki, duże liczby)
 * dostają elegancką czcionkę ozdobną automatycznie. Można to wymusić propem `display`
 * (display={true} / display={false}).
 */
export function Text({ style, display, ...rest }: TextProps & { display?: boolean }) {
  const flat = StyleSheet.flatten(style) ?? {};
  const weight = weightOf(flat.fontWeight);
  const size = typeof flat.fontSize === 'number' ? flat.fontSize : 14;
  const useDisplay = display ?? (size >= 22 && weight >= 600);
  const family = flat.fontFamily ?? (useDisplay ? fonts.display : familyFor(weight));
  return <RNText {...rest} style={[style, { fontFamily: family, fontWeight: 'normal' }]} />;
}

/** Zamiennik <TextInput> z tą samą czcionką. */
export function TextInput({ style, ...rest }: ComponentProps<typeof RNTextInput>) {
  const flat = StyleSheet.flatten(style) ?? {};
  return <RNTextInput {...rest} style={[style, { fontFamily: flat.fontFamily ?? fonts.regular, fontWeight: 'normal' }]} />;
}
