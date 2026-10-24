import { StyleSheet, Text as RNText, type TextProps } from 'react-native';
import { fonts } from '@/theme/colors';

// Na telefonie `fontWeight` nie zmienia własnej czcionki, więc przeliczamy
// wagę ze stylu na odpowiednią rodzinę DM Sans.
const BY_WEIGHT: Record<string, string> = {
  '400': fonts.regular,
  normal: fonts.regular,
  '500': fonts.medium,
  '600': fonts.semibold,
  '700': fonts.semibold,
  bold: fonts.semibold,
};

/** Drop-in zamiennik <Text>. `display` = elegancka czcionka szeryfowa (nagłówki, liczby). */
export function Text({ style, display, ...rest }: TextProps & { display?: boolean }) {
  const flat = StyleSheet.flatten(style) ?? {};
  const family =
    flat.fontFamily ?? (display ? fonts.display : (BY_WEIGHT[String(flat.fontWeight ?? '400')] ?? fonts.regular));
  return <RNText {...rest} style={[style, { fontFamily: family, fontWeight: 'normal' }]} />;
}
