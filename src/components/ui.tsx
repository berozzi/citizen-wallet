import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from '@/components/AppText';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, cardShadow } from '@/constants/appTheme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function IconChip({ tone, children }: { tone: keyof typeof colors.chip; children: ReactNode }) {
  return <View style={[s.chip, { backgroundColor: colors.chip[tone].bg }]}>{children}</View>;
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'neutral';
  icon?: keyof typeof Feather.glyphMap;
  iconNode?: ReactNode;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', icon, iconNode, style }: ButtonProps) {
  const filled = variant === 'primary';
  const fg = filled ? '#fff' : variant === 'neutral' ? colors.ink : colors.primary;
  const border = variant === 'neutral' ? colors.field : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: filled ? colors.primary : '#fff', borderColor: border, opacity: pressed ? 0.85 : 1 },
        style,
      ]}>
      {iconNode ?? (icon ? <Feather name={icon} size={20} color={fg} /> : null)}
      <Text style={[s.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radius.lg,
    ...cardShadow,
  },
  chip: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  btn: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: { fontFamily: fonts.semibold, fontSize: 16 },
});
