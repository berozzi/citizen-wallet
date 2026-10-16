/**
 * PORTFEL KART — zakładka "Karty" (moduł 1).
 * ---------------------------------------------------------------------------
 * Siatka kafelków 2-kolumnowa + wyszukiwarka u góry + przycisk "Dodaj kartę".
 * Wyszukiwanie filtruje po nazwie karty i nazwie sklepu (bez rozróżniania
 * wielkości liter), więc wpisanie "bied" od razu zawęża listę.
 *
 * Dotknięcie kafelka otwiera EKRAN KASOWY (/card/[id]) z kodem do zeskanowania.
 */
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CardTile, EmptyState, ScreenContainer } from '@/components';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '@/theme/colors';
import { useCards } from '@/store/CardsContext';

export default function CardsScreen() {
  const router = useRouter();
  const { cards, isLoading } = useCards();
  const [query, setQuery] = useState('');

  // Filtrowanie listy po frazie wpisanej w wyszukiwarkę.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) => c.name.toLowerCase().includes(q) || c.storeName.toLowerCase().includes(q)
    );
  }, [cards, query]);

  return (
    <ScreenContainer style={styles.root}>
      {/* Nagłówek ekranu */}
      <View style={styles.header}>
        <Text style={styles.title}>Portfel Kart</Text>
        <Text style={styles.subtitle}>{cards.length} kart w portfelu</Text>
      </View>

      {/* Wyszukiwarka */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Szukaj karty lub sklepu..."
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {/* Siatka kart */}
      {!isLoading && filtered.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title={query ? 'Brak wyników' : 'Twój portfel jest pusty'}
          message={
            query
              ? 'Nie znaleźliśmy karty pasującej do tej frazy. Spróbuj innej nazwy.'
              : 'Dodaj pierwszą kartę lojalnościową, a zawsze będziesz mieć ją pod ręką na kasie.'
          }
          actionLabel={query ? undefined : 'Dodaj kartę'}
          onActionPress={query ? undefined : () => router.push('/card/new')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CardTile
              card={item}
              variant="grid"
              style={styles.tile}
              onPress={() => router.push({ pathname: '/card/[id]', params: { id: item.id } })}
            />
          )}
        />
      )}

      {/* Pływający przycisk "Dodaj kartę" (FAB) */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/card/new')}
      >
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.fabLabel}>Dodaj kartę</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    paddingHorizontal: spacing.lg,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    height: '100%',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120, // miejsce na FAB
    gap: spacing.md,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  tile: {
    minHeight: 128,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    ...shadow.floating,
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabLabel: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
