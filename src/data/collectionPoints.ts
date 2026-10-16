/**
 * PUNKTY ZBIÓRKI (dane demonstracyjne) — moduł 3: mapa butelkomatów i PSZOK-ów.
 * ---------------------------------------------------------------------------
 * W produkcji te dane przyszłyby z API gminy / bazy Systemu Kaucyjnego
 * (np. z Geoportalu). W MVP trzymamy przykładowy zestaw dla Krakowa,
 * żeby mapa i filtrowanie po odległości działały od razu offline.
 */
import type { CollectionPoint } from '@/types';

export const COLLECTION_POINTS: CollectionPoint[] = [
  {
    id: 'cp-1',
    name: 'Biedronka — ul. Długa',
    address: 'ul. Długa 42, Kraków',
    kind: 'butelkomat',
    latitude: 50.0617,
    longitude: 19.9373,
    hours: 'Pn–Nd 6:00–22:00',
  },
  {
    id: 'cp-2',
    name: 'Lidl — ul. Batorego',
    address: 'ul. Stefana Batorego 5, Kraków',
    kind: 'butelkomat',
    latitude: 50.0669,
    longitude: 19.9236,
    hours: 'Pn–Nd 7:00–22:00',
  },
  {
    id: 'cp-3',
    name: 'PSZOK — ul. Nowochorążowska',
    address: 'ul. Nowochorążowska 28, Kraków',
    kind: 'pszok',
    latitude: 50.0494,
    longitude: 19.9551,
    hours: 'Wt–Sb 8:00–18:00',
  },
  {
    id: 'cp-4',
    name: 'PSZOK Bieżanów',
    address: 'ul. Jana Pawła II 199, Kraków',
    kind: 'pszok',
    latitude: 50.0262,
    longitude: 20.0341,
    hours: 'Pn–Pt 9:00–17:00',
  },
  {
    id: 'cp-5',
    name: 'Kaufland — ul. Conrada',
    address: 'ul. Juliusza Conrada 4, Kraków',
    kind: 'butelkomat',
    latitude: 50.0983,
    longitude: 19.8998,
    hours: 'Pn–Nd 7:00–22:00',
  },
  {
    id: 'cp-6',
    name: 'Zbiórka elektrośmieci — Aleje',
    address: 'Aleje Trzech Wieszczów (plac przy MOCAKu), Kraków',
    kind: 'elektrosmieci',
    latitude: 50.0547,
    longitude: 19.9641,
    hours: 'Sob 10:00–14:00',
  },
  {
    id: 'cp-7',
    name: 'Media Markt — Galeria Krakowska',
    address: 'ul. Pawia 5, Kraków',
    kind: 'elektrosmieci',
    latitude: 50.0681,
    longitude: 19.9477,
    hours: 'Pn–Nd 9:00–21:00 (zwrot przy kasie)',
  },
  {
    id: 'cp-8',
    name: 'Carrefour — Zakopianka',
    address: 'ul. Zakopiańska 62, Kraków',
    kind: 'butelkomat',
    latitude: 49.9943,
    longitude: 19.9053,
    hours: 'Pn–Nd 7:00–22:00',
  },
];

/** Etykiety typów punktów — do filtrów na mapie. */
export const COLLECTION_KIND_LABELS: Record<CollectionPoint['kind'], string> = {
  butelkomat: 'Butelkomaty',
  pszok: 'PSZOK',
  elektrosmieci: 'Elektrośmieci',
};
