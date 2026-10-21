import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/constants/appTheme';
import { ALL_BRANDS } from '@/constants/brands';
import { StoreCard } from '@/components/StoreCard';

/** Podgląd wszystkich kart sieci (do sprawdzenia wyglądu). Można usunąć po obejrzeniu. */
export default function BrandGalleryScreen() {
  const insets = useSafeAreaInsets();
  const rows: (typeof ALL_BRANDS)[] = [];
  for (let i = 0; i < ALL_BRANDS.length; i += 2) rows.push(ALL_BRANDS.slice(i, i + 2));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[s.content, { paddingTop: insets.top + 24 }]}>
      <Text style={s.title}>Karty sieci</Text>
      {rows.map((row) => (
        <View key={row[0]} style={s.row}>
          {row.map((b) => (
            <StoreCard key={b} brand={b} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 12, width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 12 },
});
