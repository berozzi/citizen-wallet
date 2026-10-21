import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '@/constants/appTheme';
import { Button } from '@/components/ui';

export default function Login() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = () => {
    // TODO: Twoja logika logowania. Po sukcesie:
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.primary }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={[s.hero, { paddingTop: insets.top + 40 }]}>
          <View style={s.logo}>
            <Feather name="briefcase" size={28} color={colors.ink} />
          </View>
          <Text style={s.title}>Portfel{'\n'}Obywatela</Text>
          <Text style={s.tagline}>Karty, paragony i kaucje w jednym miejscu.</Text>
        </View>

        <View style={[s.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={s.h2}>Zaloguj się</Text>

          <View style={s.field}>
            <Text style={s.label}>E-mail</Text>
            <View style={s.input}>
              <Feather name="mail" size={20} color={colors.muted} />
              <TextInput
                style={s.text}
                value={email}
                onChangeText={setEmail}
                placeholder="jan@przyklad.pl"
                placeholderTextColor="#7C8A84"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="E-mail"
              />
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Hasło</Text>
            <View style={s.input}>
              <Feather name="lock" size={20} color={colors.muted} />
              <TextInput
                style={s.text}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#7C8A84"
                secureTextEntry={!show}
                autoComplete="password"
                accessibilityLabel="Hasło"
              />
              <Pressable accessibilityRole="button" accessibilityLabel={show ? 'Ukryj hasło' : 'Pokaż hasło'} onPress={() => setShow((v) => !v)} style={s.show}>
                <Text style={s.showText}>{show ? 'Ukryj' : 'Pokaż'}</Text>
              </Pressable>
            </View>
            <Pressable accessibilityRole="link" style={{ alignSelf: 'flex-end' }} onPress={() => { /* TODO: reset hasła */ }}>
              <Text style={s.link}>Nie pamiętasz hasła?</Text>
            </Pressable>
          </View>

          <Button label="Zaloguj się" onPress={submit} />

          <View style={s.or}>
            <View style={s.line} />
            <Text style={s.orText}>lub</Text>
            <View style={s.line} />
          </View>

          {/* Odcisk palca: dodaj `npx expo install expo-local-authentication` */}
          <Button
            label="Zaloguj odciskiem palca"
            variant="outline"
            iconNode={<MaterialCommunityIcons name="fingerprint" size={22} color={colors.primary} />}
            onPress={() => { /* TODO */ }}
          />
          <Button label="Kontynuuj z Google" variant="neutral" onPress={() => { /* TODO */ }} />

          <View style={s.footer}>
            <Text style={s.footText}>
              Nie masz konta?{' '}
              <Text style={s.link} onPress={() => { /* TODO: rejestracja */ }}>Załóż konto</Text>
            </Text>
            <Text style={s.legal}>Logując się, akceptujesz Regulamin i Politykę prywatności.</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  hero: { paddingHorizontal: 24, paddingBottom: 56, gap: 14 },
  logo: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, color: '#fff' },
  tagline: { fontFamily: fonts.regular, fontSize: 15, color: '#D3EBE4' },
  sheet: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 24, gap: 16 },
  h2: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  field: { gap: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, borderWidth: 1.5, borderColor: colors.field, borderRadius: radius.sm, paddingHorizontal: 14 },
  text: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.ink, height: '100%' },
  show: { minHeight: 44, justifyContent: 'center' },
  showText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary },
  link: { fontFamily: fonts.semibold, fontSize: 14, color: colors.primary },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.line },
  orText: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  footer: { marginTop: 'auto', alignItems: 'center', gap: 8, paddingTop: 8 },
  footText: { fontFamily: fonts.regular, fontSize: 14, color: colors.ink },
  legal: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, textAlign: 'center' },
});
