import { Image, ImageSourcePropType, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '@/constants/appTheme';
import { Button } from '@/components/ui';
import { Decor, type Brand } from '@/components/StoreCard';
import { BRANDS } from '@/constants/brands';

function Ladybug() {
  return (
    <Svg width={150} height={150} viewBox="0 0 120 120" accessibilityRole="image" accessibilityLabel="Biedronka">
      <Path d="M52 24 Q46 10 36 8" stroke="#14231F" strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M68 24 Q74 10 84 8" stroke="#14231F" strokeWidth={3} strokeLinecap="round" fill="none" />
      <Circle cx={60} cy={68} r={42} fill="#FF4A4F" stroke="#fff" strokeWidth={4} />
      <Circle cx={60} cy={28} r={15} fill="#14231F" stroke="#fff" strokeWidth={3} />
      <Line x1={60} y1={44} x2={60} y2={110} stroke="#14231F" strokeWidth={3} />
      <Circle cx={40} cy={60} r={7} fill="#14231F" />
      <Circle cx={80} cy={60} r={7} fill="#14231F" />
      <Circle cx={42} cy={88} r={6} fill="#14231F" />
      <Circle cx={78} cy={88} r={6} fill="#14231F" />
    </Svg>
  );
}

function Basket() {
  return (
    <Svg width={150} height={150} viewBox="0 0 120 120" accessibilityRole="image" accessibilityLabel="Lidl">
      <Circle cx={60} cy={60} r={54} fill="#FFD500" />
      <Path d="M28 38 H42 L50 76 H90 L96 50 H46" stroke="#0A3F8F" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx={56} cy={92} r={6} fill="#0A3F8F" />
      <Circle cx={84} cy={92} r={6} fill="#0A3F8F" />
    </Svg>
  );
}

type Props = {
  brand: Brand;
  visible: boolean;
  name?: string; // nazwa karty użytkownika (domyślnie nazwa programu/sieci)
  /** Oficjalne logo (plik z assets/). Jeśli podane, zastępuje narysowaną grafikę. */
  logo?: ImageSourcePropType;
  onClose: () => void;
  onOpenCard: () => void;
};

/** Okno z dużą grafiką sieci, otwierane po kliknięciu karty. */
export function StoreSheet({ brand, visible, name, logo, onClose, onOpenCard }: Props) {
  const insets = useSafeAreaInsets();
  const def = BRANDS[brand];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose} accessibilityLabel="Zamknij okno">
        <Pressable style={[s.sheet, { paddingBottom: insets.bottom + 20 }]} onPress={() => {}}>
          <View style={[s.hero, { backgroundColor: def.from }]}>
            <View style={[s.blob, { right: -60, bottom: -90, width: 250, height: 250, borderRadius: 125, backgroundColor: def.to, opacity: 0.55 }]} />
            <View style={[s.blob, { left: -50, top: -70, width: 170, height: 170, borderRadius: 85, backgroundColor: '#fff', opacity: 0.12 }]} />
            {logo ? (
              <Image source={logo} style={s.logo} resizeMode="contain" accessibilityLabel={def.chain} />
            ) : brand === 'biedronka' ? (
              <Ladybug />
            ) : brand === 'lidl' ? (
              <Basket />
            ) : (
              <>
                <Decor brand={brand} scale={2.2} />
                <Text style={s.big}>{def.chain}</Text>
              </>
            )}
          </View>

          <View style={s.body}>
            <Text style={s.name}>{name ?? def.card ?? def.chain}</Text>
            <Text style={s.chain}>Karta lojalnościowa · {def.chain}</Text>
            <Button label="Pokaż kartę" onPress={onOpenCard} />
            <Button label="Zamknij" variant="neutral" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(20,35,31,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  hero: { height: 210, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  blob: { position: 'absolute', pointerEvents: 'none' },
  logo: { width: 150, height: 150 },
  big: { fontFamily: fonts.display, fontSize: 40, color: '#fff' },
  body: { padding: 20, gap: 12 },
  name: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  chain: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginBottom: 4 },
});
