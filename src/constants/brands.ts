/**
 * Rejestr sieci: kolory kart + proste ozdobniki (własne, geometryczne – NIE oficjalne logotypy).
 * Pozycje ozdobników są liczone od prawego górnego rogu karty (right/top, w px; wartości ujemne wystają poza kartę).
 */
export type Brand =
  | 'biedronka' | 'lidl' | 'rossmann' | 'zabka' | 'kaufland' | 'carrefour'
  | 'mediamarkt' | 'payback' | 'orlen' | 'allegro' | 'decathlon' | 'empik';

export type Shape = {
  k: 'circle' | 'ring' | 'rect' | 'tri';
  right: number;
  top: number;
  size: number; // szerokość
  h?: number; // wysokość (domyślnie = size)
  color: string;
  width?: number; // grubość obrysu (ring)
  rot?: number; // obrót w stopniach (rect)
};

export type BrandDef = {
  chain: string; // nazwa sieci
  card?: string; // nazwa programu / karty, jeśli znana
  from: string; // kolor karty (biały tekst ma na nim kontrast ≥4,5:1)
  to: string; // ciemniejszy odcień (plama w rogu)
  shapes: Shape[];
};

const W = (a: number) => `rgba(255,255,255,${a})`;
const DARK = 'rgba(20,35,31,0.65)';

export const BRANDS: Record<Brand, BrandDef> = {
  biedronka: {
    chain: 'Biedronka', card: 'Moja Biedronka', from: '#C8171D', to: '#7E0C11',
    shapes: [
      { k: 'circle', right: -16, top: -16, size: 78, color: W(0.2) },
      { k: 'circle', right: 34, top: 10, size: 8, color: DARK },
      { k: 'circle', right: 14, top: 18, size: 8, color: DARK },
      { k: 'circle', right: 28, top: 32, size: 8, color: DARK },
    ],
  },
  lidl: {
    chain: 'Lidl', card: 'Lidl Plus', from: '#0A4FB0', to: '#06265C',
    shapes: [{ k: 'ring', right: -12, top: -12, size: 60, color: '#FFD500', width: 7 }],
  },
  rossmann: {
    chain: 'Rossmann', from: '#B3123E', to: '#650A22',
    shapes: [
      { k: 'circle', right: -14, top: -14, size: 70, color: W(0.2) },
      { k: 'circle', right: 40, top: -8, size: 40, color: W(0.16) },
    ],
  },
  zabka: {
    chain: 'Żabka', from: '#00843D', to: '#00522A',
    shapes: [
      { k: 'circle', right: 46, top: -8, size: 32, color: '#fff' },
      { k: 'circle', right: 8, top: -8, size: 32, color: '#fff' },
      { k: 'circle', right: 55, top: 4, size: 13, color: '#14231F' },
      { k: 'circle', right: 17, top: 4, size: 13, color: '#14231F' },
    ],
  },
  kaufland: {
    chain: 'Kaufland', from: '#D40F14', to: '#76080B',
    shapes: [
      { k: 'rect', right: -6, top: -6, size: 58, color: W(0.2), rot: 45 },
      { k: 'rect', right: 34, top: 14, size: 20, color: W(0.4), rot: 45 },
    ],
  },
  carrefour: {
    chain: 'Carrefour', from: '#0C3C8C', to: '#061F4E',
    shapes: [
      { k: 'circle', right: -14, top: -14, size: 70, color: '#E1251B' },
      { k: 'circle', right: 36, top: 0, size: 30, color: W(0.9) },
    ],
  },
  mediamarkt: {
    chain: 'MediaMarkt', from: '#D90000', to: '#780000',
    shapes: [
      { k: 'rect', right: -8, top: 10, size: 64, h: 8, color: W(0.9) },
      { k: 'rect', right: -8, top: 24, size: 46, h: 8, color: W(0.9) },
      { k: 'rect', right: -8, top: 38, size: 28, h: 8, color: W(0.9) },
    ],
  },
  payback: {
    chain: 'Payback', from: '#2447D6', to: '#13276F',
    shapes: [
      { k: 'circle', right: 12, top: 10, size: 20, color: W(0.92) },
      { k: 'circle', right: 38, top: 10, size: 20, color: '#FFD100' },
      { k: 'circle', right: 12, top: 36, size: 20, color: '#FF4A4F' },
      { k: 'circle', right: 38, top: 36, size: 20, color: W(0.45) },
    ],
  },
  orlen: {
    chain: 'Orlen', from: '#C9001B', to: '#6B000E',
    shapes: [
      { k: 'circle', right: -22, top: -22, size: 90, color: W(0.18) },
      { k: 'circle', right: 10, top: 10, size: 28, color: '#fff' },
    ],
  },
  allegro: {
    chain: 'Allegro', from: '#D44200', to: '#7A2600',
    shapes: [
      { k: 'rect', right: -10, top: -10, size: 66, color: W(0.22), rot: 15 },
      { k: 'rect', right: 30, top: 16, size: 22, color: '#fff', rot: 15 },
    ],
  },
  decathlon: {
    chain: 'Decathlon', from: '#0077B6', to: '#004469',
    shapes: [
      { k: 'tri', right: 8, top: 10, size: 56, h: 44, color: W(0.9) },
      { k: 'tri', right: 50, top: 28, size: 38, h: 28, color: W(0.5) },
    ],
  },
  empik: {
    chain: 'Empik', from: '#1B1B1B', to: '#000000',
    shapes: [
      { k: 'circle', right: -18, top: -18, size: 80, color: '#FFD100' },
      { k: 'ring', right: 28, top: 8, size: 30, color: W(0.7), width: 4 },
    ],
  },
};

/** Karta nierozpoznana (własna) – neutralny, zielony wygląd. */
export const NEUTRAL: BrandDef = {
  chain: '', from: '#0B5D4E', to: '#052E27',
  shapes: [{ k: 'circle', right: -16, top: -16, size: 78, color: W(0.18) }],
};

export const ALL_BRANDS = Object.keys(BRANDS) as Brand[];

const KEYWORDS: [Brand, string[]][] = [
  ['biedronka', ['biedronka']], ['lidl', ['lidl']], ['rossmann', ['rossmann', 'rosman']],
  ['zabka', ['zabka', 'zappka']], ['kaufland', ['kaufland']], ['carrefour', ['carrefour']],
  ['mediamarkt', ['mediamarkt', 'media markt']], ['payback', ['payback']], ['orlen', ['orlen', 'vitay']],
  ['allegro', ['allegro']], ['decathlon', ['decathlon', 'dekathlon']], ['empik', ['empik']],
];

/** Rozpoznaje sieć po nazwie karty, np. "Moja Biedronka" → 'biedronka'. Zwraca undefined, gdy nie pasuje. */
export function brandFromName(text: string): Brand | undefined {
  const t = text.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return KEYWORDS.find(([, words]) => words.some((w) => t.includes(w)))?.[0];
}
