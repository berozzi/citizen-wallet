/**
 * CONTEXT KART — moduł 1 (Wirtualny Portfel Kart).
 * ---------------------------------------------------------------------------
 * Trzyma listę kart lojalnościowych w pamięci + zapisuje ją do AsyncStorage
 * po każdej mutacji (działa więc offline i przeżywa restart apki).
 * Przy pierwszym uruchomieniu seeduje 2 karty-demo, żeby kokpit nie był pusty.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS, saveJson, loadJsonNullable } from '@/storage/storage';
import type { LoyaltyCard } from '@/types';
import { BRANDS } from '@/data/brands';
import { uid } from '@/utils/dates';

/** Dane wejściowe do dodania karty (bez pól generowanych automatycznie). */
export type NewCardInput = Pick<
  LoyaltyCard,
  'name' | 'storeName' | 'brandId' | 'color' | 'textColor' | 'barcodeValue' | 'barcodeFormat'
>;

interface CardsContextValue {
  cards: LoyaltyCard[];
  /** true dopóki nie wczytamy danych z dysku — ekrany pokazują spinner. */
  isLoading: boolean;
  addCard: (input: NewCardInput) => Promise<LoyaltyCard>;
  deleteCard: (id: string) => Promise<void>;
  /** Oznacz kartę jako \"używaną na kasie\" — napędza sekcję \"najczęściej używane\". */
  markCardUsed: (id: string) => Promise<void>;
  getCard: (id: string) => LoyaltyCard | undefined;
  /** Najczęściej używane karty (do kokpitu). */
  mostUsedCards: (limit?: number) => LoyaltyCard[];
}

const CardsContext = createContext<CardsContextValue | null>(null);

/** Karty demo na pierwszy start (tylko gdy storage jest puste). */
function seedCards(): LoyaltyCard[] {
  const now = Date.now();
  const biedronka = BRANDS.find((b) => b.id === 'biedronka')!;
  const lidl = BRANDS.find((b) => b.id === 'lidl')!;
  return [
    {
      id: uid(),
      name: 'Moja Biedronka',
      storeName: 'Biedronka',
      brandId: biedronka.id,
      color: biedronka.color,
      textColor: biedronka.textColor,
      barcodeValue: '2401234567890',
      barcodeFormat: 'ean13',
      createdAt: now,
      useCount: 12,
      lastUsedAt: now - 2 * 24 * 60 * 60 * 1000,
    },
    {
      id: uid(),
      name: 'Lidl Plus',
      storeName: 'Lidl',
      brandId: lidl.id,
      color: lidl.color,
      textColor: lidl.textColor,
      barcodeValue: '9876543210987',
      barcodeFormat: 'ean13',
      createdAt: now,
      useCount: 7,
      lastUsedAt: now - 5 * 24 * 60 * 60 * 1000,
    },
  ];
}

export function CardsProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Wczytaj dane z dysku (albo zaseeduj demo przy pierwszym starcie).
  useEffect(() => {
    (async () => {
      const stored = await loadJsonNullable<LoyaltyCard[]>(STORAGE_KEYS.cards);
      const data = stored ?? seedCards();
      if (stored == null) await saveJson(STORAGE_KEYS.cards, data);
      setCards(data);
      setIsLoading(false);
    })();
  }, []);

  // Zapisuj przy każdej zmianie (po zakończeniu ładowania).
  useEffect(() => {
    if (!isLoading) void saveJson(STORAGE_KEYS.cards, cards);
  }, [cards, isLoading]);

  const value = useMemo<CardsContextValue>(() => {
    return {
      cards,
      isLoading,
      addCard: async (input) => {
        const card: LoyaltyCard = {
          ...input,
          id: uid(),
          createdAt: Date.now(),
          useCount: 0,
          lastUsedAt: null,
        };
        setCards((prev) => [card, ...prev]);
        return card;
      },
      deleteCard: async (id) => {
        setCards((prev) => prev.filter((c) => c.id !== id));
      },
      markCardUsed: async (id) => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, useCount: c.useCount + 1, lastUsedAt: Date.now() } : c
          )
        );
      },
      getCard: (id) => cards.find((c) => c.id === id),
      mostUsedCards: (limit = 3) =>
        [...cards]
          .sort((a, b) => {
            // Najpierw częstość użycia, potem świeżość ostatniego użycia.
            if (b.useCount !== a.useCount) return b.useCount - a.useCount;
            return (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0);
          })
          .slice(0, limit),
    };
  }, [cards, isLoading]);

  return <CardsContext.Provider value={value}>{children}</CardsContext.Provider>;
}

/** Hook do wygodnego dostępu do kontekstu kart. */
export function useCards(): CardsContextValue {
  const ctx = useContext(CardsContext);
  if (!ctx) throw new Error('useCards musi być użyty wewnątrz <CardsProvider>');
  return ctx;
}
