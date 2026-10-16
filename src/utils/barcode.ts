/**
 * ENKODER CODE128 — serce \"ekranu kasowego\".
 * ---------------------------------------------------------------------------
 * Aplacja musi wyświetlać DUŻY, OSTRY kod kreskowy bez internetu, więc
 * generujemy go sami (czysty JS + react-native-svg), bez serwera i bez
 * zewnętrznych serwisów. CODE128-B obsługuje wszystkie drukowalne znaki,
 * więc mieści się w nim każdy numer karty lojalnościowej.
 *
 * Referencja: specyfikacja GS1 Code 128 — każdy wzorzec to 6 szerokości
 * modułów (bar, przerwa, bar, przerwa, bar, przerwa); stop = 7 modułów.
 */

/**
 * Tabela wzorców Code 128 (wartości 0–106).
 * Każda litera = szerokość jednego elementu w modułach.
 */
const CODE128_PATTERNS: readonly string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

// Stałe startowe (indeksy w tabeli) — tryb B (drukowalne znaki ASCII 32–126).
const START_B = 104;
const STOP = 106;

/** Pojedynczy \"moduł\" kodu: czarna kreska o danej szerokości. */
export interface BarcodeBar {
  /** Pozycja startowa w modułach (od lewej, wraz z cichą strefą). */
  x: number;
  /** Szerokość w modułach. */
  width: number;
}

/** Wynik enkodowania — lista czarnych kresek + suma modułów. */
export interface EncodedBarcode {
  bars: BarcodeBar[];
  /** Całkowita szerokość kodu w modułach (z cichymi strefami). */
  totalModules: number;
}

/** Szerokość cichiej strefy (zgodnie ze specyfikacją: min. 10x moduł). */
const QUIET_ZONE_MODULES = 10;

/**
 * Enkoduj tekst w Code 128B na listę kresek.
 * Zwraca null, gdy tekst zawiera znaki spoza drukowalnego ASCII.
 */
export function encodeCode128(value: string): EncodedBarcode | null {
  if (value.length === 0) return null;

  // 1) Mapowanie znaków na wartości kodowe (ASCII - 32).
  const charValues: number[] = [];
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code > 126) return null; // znak nieobsługiwany przez tryb B
    charValues.push(code - 32);
  }

  // 2) Suma kontrolna: StartB + suma (pozycja * wartość), mod 103.
  let checksum = START_B;
  charValues.forEach((v, i) => {
    checksum += v * (i + 1);
  });
  checksum %= 103;

  // 3) Pełna sekwencja wartości: start + dane + checksum + stop.
  const sequence = [START_B, ...charValues, checksum, STOP];

  // 4) Zamiana wartości na szerokości (bar/przerwa naprzemiennie, start od bara).
  const bars: BarcodeBar[] = [];
  let cursor = QUIET_ZONE_MODULES; // zaczynamy po cichej strefie z lewej
  let isBar = true; // Code128 zawsze zaczyna się czarnym barem
  for (const valueCode of sequence) {
    const pattern = CODE128_PATTERNS[valueCode];
    for (const widthChar of pattern) {
      const width = Number(widthChar);
      if (isBar) {
        bars.push({ x: cursor, width });
      }
      cursor += width;
      isBar = !isBar;
    }
  }

  const totalModules = cursor + QUIET_ZONE_MODULES; // cicha strefa z prawej
  return { bars, totalModules };
}

/**
 * Grupuje cyfry numeru karty w czytelne bloki (\"1234 5678 9012\").
 * Używane pod kodem na ekranie kasowym — łatwiej zweryfikować wzrokowo.
 */
export function groupDigits(value: string, groupSize = 4): string {
  const cleaned = value.replace(/\s+/g, '');
  const groups: string[] = [];
  for (let i = 0; i < cleaned.length; i += groupSize) {
    groups.push(cleaned.slice(i, i + groupSize));
  }
  return groups.join(' ');
}
