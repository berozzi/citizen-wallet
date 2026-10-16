/**
 * KATALOG MAREK — gotowe logo/kolory popularnych polskich sklepów.
 * ---------------------------------------------------------------------------
 * Po zeskanowaniu karty użytkownik \"kataloguje\" ją: wybiera markę z listy
 * (albo wpisuje własną nazwę). Kafelek karty dostaje wtedy kolor marki,
 * dzięki czemu użytkownik znajduje kartę wzrokiem w ułamek sekundy.
 *
 * `textColor` dobieramy dla kontrastu: na żółci/czerwieni — grafit, na
 * ciemnych tłach — biel (WCAG AA dla dużych elementów).
 */
export interface BrandPreset {
  id: string;
  name: string;
  color: string;
  textColor: string;
  /** Inicjały/monogram wyświetlany zamiast graficznego logo. */
  monogram: string;
}

export const BRANDS: BrandPreset[] = [
  { id: 'biedronka', name: 'Biedronka', color: '#FDE028', textColor: '#1A202C', monogram: 'B' },
  { id: 'lidl', name: 'Lidl', color: '#0050AA', textColor: '#FFFFFF', monogram: 'L' },
  { id: 'rossmann', name: 'Rossmann', color: '#CC0000', textColor: '#FFFFFF', monogram: 'R' },
  { id: 'żabka', name: 'Żabka', color: '#00693E', textColor: '#FFFFFF', monogram: 'Ż' },
  { id: 'kaufland', name: 'Kaufland', color: '#003E7E', textColor: '#FFFFFF', monogram: 'K' },
  { id: 'carrefour', name: 'Carrefour', color: '#004E9F', textColor: '#FFFFFF', monogram: 'C' },
  { id: 'media_markt', name: 'Media Markt', color: '#DF0000', textColor: '#FFFFFF', monogram: 'MM' },
  { id: 'payback', name: 'Payback', color: '#1A1F71', textColor: '#FFFFFF', monogram: 'P' },
  { id: 'orlen', name: 'Orlen', color: '#E30613', textColor: '#FFFFFF', monogram: 'O' },
  { id: 'allegro', name: 'Allegro', color: '#FF5A00', textColor: '#FFFFFF', monogram: 'A' },
  { id: 'decathlon', name: 'Decathlon', color: '#0082C3', textColor: '#FFFFFF', monogram: 'D' },
  { id: 'empik', name: 'Empik', color: '#1A202C', textColor: '#FFFFFF', monogram: 'E' },
];

/** Wyszukaj markę po ID (undefined, gdy niestandardowa). */
export function findBrand(brandId?: string | null): BrandPreset | undefined {
  return BRANDS.find((b) => b.id === brandId);
}

/** Domyślne ustawienia karty \"własnej\" (bez marki). */
export const CUSTOM_BRAND_STYLE = { color: '#007A78', textColor: '#FFFFFF', monogram: '?' } as const;
