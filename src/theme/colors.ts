/**
 * SYSTEM PROJEKTOWY — kolory, odstępy, promienie, typografia
 * ---------------------------------------------------------------------------
 * Paleta "Głęboka zieleń + bursztyn", ułożona tak, żeby elementy się nie zlewały:
 *  - tło ekranów jest chłodną szarością (#E6EBE8), a karty/kafelki są BIAŁE
 *    z wyraźną ramką — karta zawsze odcina się od tła,
 *  - kolor główny to ciemna zieleń (#0B5D4E) — biały tekst na niej ma duży kontrast,
 *  - akcent ostrzegawczy to ciemny bursztyn (czytelny jako tekst), a jasny
 *    bursztyn (`highlight`) służy tylko do dekoracji.
 *
 * UWAGA: `background` i `surface` zamieniły się rolami względem starego motywu:
 * teraz background = tło ekranu (szare), surface = karta (białe).
 *
 * Cała reszta aplikacji importuje kolory WYŁĄCZNIE stąd.
 */

export const colors = {
  /** Kolor główny (brand) — aktywne zakładki, przyciski, akcenty. */
  primary: '#0B5D4E',
  primaryDark: '#08463B',
  /** Rozjaśniona wersja primary — tło „chipów" i wyróżnień. */
  primaryTint: '#CFEBE3',

  /** Tła. */
  background: '#E6EBE8', // tło ekranów
  surface: '#FFFFFF', // karty i kafelki
  surfaceRaised: '#FFFFFF',

  /** Tekst. */
  text: '#14231F',
  textSecondary: '#4F5F59',
  textOnPrimary: '#FFFFFF',

  /** Linie i obramowania (wyraźniejsze niż wcześniej). */
  border: '#C9D2CE',

  /** Akcenty ostrzegawcze i statusy. */
  accent: '#A85400', // ciemny bursztyn — czytelny jako tekst i ikona
  accentTint: '#FFEFCC',
  highlight: '#F2B134', // jasny bursztyn — tylko dekoracje (kółka, plakietki)
  success: '#2B7A3D',
  warning: '#D9971A',
  danger: '#C53030',

  black: '#000000',
  white: '#FFFFFF',
} as const;

/** Odstępy (8pt grid). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Promienie zaokrągleń. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Rozmiary czcionek. */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
} as const;

/** Wagi (używane w stylach; rodzinę dobiera komponent Text z AppText.tsx). */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Rodziny czcionek (ładowane w hooks/useAppFonts.ts). */
export const fonts = {
  display: 'Fraunces_600SemiBold',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
} as const;

/** Cienie — uniesienie kart. */
export const shadow = {
  card: {
    shadowColor: '#14231F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: '#14231F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;
