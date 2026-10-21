import { useState } from 'react';
import { ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/constants/appTheme';
import { Button, Card, IconChip } from '@/components/ui';
import { AdSlot } from '@/components/AdSlot';
import { StoreCard, type Brand } from '@/components/StoreCard';
import { StoreSheet } from '@/components/StoreSheet';

// Oficjalne logotypy: wrzuć pliki do /assets i odkomentuj (ścieżka względem tego pliku).
const LOGOS: Partial<Record<Brand, ImageSourcePropType>> = {
  // biedronka: require('../../assets/biedronka.png'),
  // lidl: require('../../assets/lidl.png'),
};

export default function Kokpit() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [brand, setBrand] = useState<Brand>('biedronka');
  const [sheetOpen, setSheetOpen] = useState(false);
  const openSheet = (b: Brand) => {
    setBrand(b);
    setSheetOpen(true);
  };

  // TODO: podmień na swoje dane (store / AsyncStorage)
  const data = {
    name: 'Jan',
    cards: 2,
    spent: '132,47 zł',
    bottles: 33,
    warranties: 1,
  };

  const stats = [
    { tone: 'teal', icon: <Feather name="credit-card" size={20} color={colors.chip.teal.fg} />, value: String(data.cards), label: 'Karty lojalnościowe' },
    { tone: 'amber', icon: <MaterialCommunityIcons name="cash-multiple" size={22} color={colors.chip.amber.fg} />, value: data.spent, label: 'Wydatki w tym miesiącu' },
    { tone: 'green', icon: <MaterialCommunityIcons name="recycle" size={22} color={colors.chip.green.fg} />, value: String(data.bottles), label: 'Zwrócone butelki' },
    { tone: 'indigo', icon: <Feather name="shield" size={20} color={colors.chip.indigo.fg} />, value: String(data.warranties), label: 'Pilnowane gwarancje' },
  ] as const;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[s.content, { paddingTop: insets.top + 24 }]}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.hello}>Cześć, {data.name}</Text>
          <Text style={s.sub}>Twój portfel obywatela w jednym miejscu</Text>
        </View>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{data.name[0]}</Text>
        </View>
      </View>

      <View style={s.grid}>
        {stats.map((st) => (
          <Card key={st.label} style={s.tile}>
            <IconChip tone={st.tone}>{st.icon}</IconChip>
            <View>
              <Text style={s.value}>{st.value}</Text>
              <Text style={s.label}>{st.label}</Text>
            </View>
          </Card>
        ))}
      </View>

      {/* Reklama 1 – w miejscu dawnego paska „Do odebrania z butelkomatów” */}
      <AdSlot variant="banner" />

      <View style={s.sectionRow}>
        <Text style={s.section}>Twoje karty</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push('/cards')}>
          <Text style={s.link}>Wszystkie</Text>
        </Pressable>
      </View>
      <View style={s.row}>
        <StoreCard brand="biedronka" name="Moja Biedronka" chain="Biedronka" onPress={() => openSheet('biedronka')} />
        <StoreCard brand="lidl" name="Lidl Plus" chain="Lidl" onPress={() => openSheet('lidl')} />
      </View>

      {/* Reklama 2 – natywna */}
      <AdSlot variant="native" title="[NAZWA PARTNERA]" />

      <View style={s.row}>
        <Button label="Dodaj kartę" icon="plus" style={{ flex: 1 }} onPress={() => router.push('/card/new')} />
        <Button label="Dodaj paragon" icon="camera" variant="outline" style={{ flex: 1 }} onPress={() => router.push('/receipt/new')} />
      </View>

      {/* Reklama 3 – pasek na dole */}
      <AdSlot variant="strip" />

      <StoreSheet
        brand={brand}
        visible={sheetOpen}
        logo={LOGOS[brand]}
        onClose={() => setSheetOpen(false)}
        onOpenCard={() => {
          setSheetOpen(false);
          router.push('/cards');
        }}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 24, gap: 16, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hello: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.display, fontSize: 18, color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '48.5%', flexGrow: 1, padding: 14, gap: 10 },
  value: { fontFamily: fonts.display, fontSize: 28, color: colors.ink },
  label: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  section: { fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  link: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary },
  row: { flexDirection: 'row', gap: 12 },
});
