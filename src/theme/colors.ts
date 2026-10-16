/**
 * SYSTEM PROJEKTOWY (Design System) — Kolory, odstępy, promienie, typografia
 * ---------------------------------------------------------------------------
 * Zgodnie z dokumentacją projektu aplikacja używa jasnego, minimalistycznego motywu:
 *  - Kolor główny: Deep Teal / morski cyjan (#007A78) — nowoczesność, zaufanie, ekologia
 *  - Tło: czysta biel + jasnoszary (#F5F7FA) na kafelki/sekcje (odcinają się od bieli)
 *  - Tekst: głęboki grafit (#1A202C) — bardziej czytelny niż czysta czerń
 *  - Akcent: ciepły pomarańcz (#ED8936) — alerty (gwarancje, wywóz śmieci)
 *
 * Cała reszta aplikacji importuje kolory WYŁĄCZNIE stąd — dzięki temu
 * przemalowanie apki w jednym miejscu jest trivialne.
 */

export const colors = {
  /** Kolor główny (brand) — paski aktywnych zakładek, przyciski, akcenty. */
  primary: '#007A78',
  primaryDark: '#005E5C',
  /** Rozjaśniona wersja primary — tło \"chipów\" i wyróżnień. */
  primaryTint: '#E1F1F0',

  /** Tła. */
  background: '#FFFFFF', // czysta biel — tło ekranów
  surface: '#F5F7FA', // jasnoszary — tło sekcji i kafelków
  surfaceRaised: '#FFFFFF',

  /** Tekst. */
  text: '#1A202C', // grafit — tekst podstawowy
  textSecondary: '#718096', // szary — tekst pomocniczy (daty, opisy)
  textOnPrimary: '#FFFFFF',

  /** Linie i obramowania. */
  border: '#E2E8F0',

  /** Akcenty ostrzegawcze i statusy. */
  accent: '#ED8936', // pomarańcz — ważne alerty (gwarancja, wywóz śmieci)
  accentTint: '#FEEAD7',
  success: '#38A169', // zieleń — gwarancja ważna, wszystko OK
  warning: '#ECC94B', // żółć — gwarancja kończy się za chwilę
  danger: '#E53E3E', // czerwień — gwarancja wygasła, błędy

  black: '#000000',
  white: '#FFFFFF',
} as const;

/** Odstępy (8pt grid — wszystko wielokrotnością 4/8 px dla spójności). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Promienie zaokrągleń — miękki, \"systemowy\" charakter (Apple/Google). */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999, // pełne zaokrąglenie (przyciski, chipy)
} as const;

/** Rozmiary czcionek — skala zbliżona do systemowych dynamic types. */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
} as const;

/** Domyślny (ciężki) krój tekstu — encje wagowe inline, bez dodatkowych fontów. */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Cienie — subtelne uniesienie kafelków (elevation). */
export const shadow = {
  card: {
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
