import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius } from '@/constants/appTheme';
import { Card } from '@/components/ui';

type Props = {
  variant: 'banner' | 'native' | 'strip';
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  /** Wstaw tu prawdziwą reklamę (np. widok z SDK reklamowego) – zastąpi placeholder. */
  children?: ReactNode;
};

/** Trzy formaty reklam: banner (358×120), natywny wiersz „Sponsorowane” i cienki pasek (358×50). */
export function AdSlot({ variant, title = '[TREŚĆ REKLAMY]', subtitle, onPress, children }: Props) {
  if (variant === 'strip') {
    return (
      <View style={s.strip} accessibilityLabel="Reklama">
        {children ?? <Text style={s.stripText}>Reklama · pasek 358 × 50</Text>}
      </View>
    );
  }

  if (variant === 'native') {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={`Sponsorowane: ${title}`} onPress={onPress}>
        <Card style={s.native}>
          <View style={s.nativeTag}>
            <Text style={s.nativeTagText}>AD</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sponsored}>Sponsorowane</Text>
            <Text style={s.nativeTitle}>{title}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.ink} />
        </Card>
      </Pressable>
    );
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Reklama: ${title}`} onPress={onPress} style={s.banner}>
      <View style={s.bannerCircle} />
      <View style={s.bannerTag}>
        <Text style={s.bannerTagText}>REKLAMA</Text>
      </View>
      {children ?? (
        <View>
          <Text style={s.bannerTitle}>{title}</Text>
          <Text style={s.bannerSub}>{subtitle ?? 'Miejsce na baner 358 × 120'}</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  banner: {
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerCircle: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accent,
  },
  bannerTag: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  bannerTagText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.9, color: colors.ink },
  bannerTitle: { fontFamily: fonts.display, fontSize: 20, color: '#fff' },
  bannerSub: { fontFamily: fonts.regular, fontSize: 13, color: '#CFE0DA' },
  native: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  nativeTag: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: '#FFF3D1',
    borderColor: '#8A6A1F',
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeTagText: { fontFamily: fonts.semibold, fontSize: 11, color: '#6B3D00' },
  sponsored: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
  nativeTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  strip: {
    height: 50,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: '#8A9A94',
    borderStyle: 'dashed',
    backgroundColor: '#F3F6F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
