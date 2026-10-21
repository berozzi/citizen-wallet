import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { fonts, radius } from '@/constants/appTheme';
import { BRANDS, NEUTRAL, type Brand, type Shape } from '@/constants/brands';

export type { Brand } from '@/constants/brands';

// Wzór kodu kreskowego: na przemian kreska / przerwa (proporcje szerokości).
const BARS = [2, 1, 1, 2, 3, 1, 1, 1, 2, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 1, 3, 1, 1, 2, 2, 1];

function Barcode() {
  return (
    <View style={s.barcode}>
      {BARS.map((w, i) => (
        <View key={i} style={{ flex: w, backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.92)' : 'transparent' }} />
      ))}
    </View>
  );
}

function ShapeView({ sh, scale }: { sh: Shape; scale: number }) {
  const w = sh.size * scale;
  const h = (sh.h ?? sh.size) * scale;
  const pos = { position: 'absolute' as const, right: sh.right * scale, top: sh.top * scale, pointerEvents: 'none' as const };
  if (sh.k === 'tri') {
    return (
      <View
        style={[pos, { width: 0, height: 0, borderLeftWidth: w / 2, borderRightWidth: w / 2, borderBottomWidth: h, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: sh.color }]}
      />
    );
  }
  if (sh.k === 'ring') {
    return <View style={[pos, { width: w, height: w, borderRadius: w / 2, borderWidth: (sh.width ?? 6) * scale, borderColor: sh.color }]} />;
  }
  if (sh.k === 'rect') {
    const rot = sh.rot ? { transform: [{ rotate: `${sh.rot}deg` }] } : null;
    return <View style={[pos, rot, { width: w, height: h, borderRadius: Math.min(w, h) * 0.2, backgroundColor: sh.color }]} />;
  }
  return <View style={[pos, { width: w, height: w, borderRadius: w / 2, backgroundColor: sh.color }]} />;
}

/** Ozdobniki sieci w prawym górnym rogu rodzica (rodzic musi mieć overflow: 'hidden'). */
export function Decor({ brand, scale = 1 }: { brand?: Brand; scale?: number }) {
  const def = brand ? BRANDS[brand] : NEUTRAL;
  return (
    <>
      {def.shapes.map((sh, i) => (
        <ShapeView key={i} sh={sh} scale={scale} />
      ))}
    </>
  );
}

type Props = {
  brand?: Brand; // brak = karta własna (neutralny wygląd)
  name?: string; // domyślnie nazwa programu/sieci
  chain?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

/** Karta lojalnościowa w kolorach sieci (same widoki – wygląda tak samo na każdym telefonie). */
export function StoreCard({ brand, name, chain, onPress, style }: Props) {
  const def = brand ? BRANDS[brand] : NEUTRAL;
  const title = name ?? def.card ?? def.chain;
  const sub = chain ?? (brand && title !== def.chain ? def.chain : undefined);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sub ? `${title}, ${sub}` : title}
      onPress={onPress}
      style={({ pressed }) => [s.card, { backgroundColor: def.from, opacity: pressed ? 0.9 : 1 }, style]}>
      <View style={[s.shade, { backgroundColor: def.to }]} />
      <Decor brand={brand} />
      <View style={{ pointerEvents: 'none' }}>
        <Text style={s.name} numberOfLines={1}>{title}</Text>
        {sub ? <Text style={s.chain}>{sub}</Text> : null}
      </View>
      <Barcode />
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, height: 112, borderRadius: radius.lg, padding: 14, justifyContent: 'space-between', overflow: 'hidden' },
  shade: { position: 'absolute', right: -50, bottom: -80, width: 190, height: 190, borderRadius: 95, opacity: 0.55, pointerEvents: 'none' },
  name: { fontFamily: fonts.semibold, fontSize: 16, color: '#fff' },
  chain: { fontFamily: fonts.regular, fontSize: 12, color: '#fff', opacity: 0.9 },
  barcode: { flexDirection: 'row', height: 20, pointerEvents: 'none' },
});
