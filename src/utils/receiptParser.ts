/**
 * PARSER PARAGONU — wyciąga datę, kwotę i nazwę sklepu z linii OCR.
 * ---------------------------------------------------------------------------
 * `extractTextFromImage` zwraca tablicę linii tekstu (w kolejności jak na
 * zdjęciu). Parser działa heurystycznie: szuka słów kluczowych
 * (SUMA / RAZEM / DO ZAPŁATY...), typowych formatów dat i kwot.
 *
 * OCR nigdy nie nadpisuje danych, których nie rozpoznał — formularz zostawia
 * wtedy poprzednią wartość, a użytkownik może wszystko poprawić ręcznie.
 */

export type ParsedReceipt = {
  date: Date | null;
  total: number | null;
  store: string | null;
};

/**
 * Kwoty spotykane na polskich paragonach:
 *   12,34 · 12.34 · 1 234,56 · 1.234,56
 * Pierwsza alternatywa obsługuje separatory tysięcy, druga proste kwoty.
 */
const AMOUNT_RE = /\d{1,3}(?:[ \u00A0.]\d{3})+[.,]\d{2}(?!\d)|\d{1,6}[.,]\d{2}(?!\d)/g;

/** Słowa, przy których zwykle stoi kwota do zapłaty. */
const TOTAL_KEYWORDS =
  /(SUMA|RAZEM|DO ZAP[ŁL]ATY|TOTAL|NALE[ŻZ]NO[ŚS][ĆC]|KWOTA|ZAP[ŁL]ATA)/i;

/** Linie, których nie traktujemy jako nazwę sklepu (nagłówki/stopki paragonu). */
const STORE_IGNORE =
  /(paragon|faktura|nip|regon|suma|razem|total|kasa|kasjer|sprzedawca|data|godzina|tel\.?|www|dziękujemy)/i;

/** Zamienia tekst kwoty na liczbę (spacje/kropki mogą być separatorami tysięcy). */
function toNumber(raw: string): number {
  const normalized = raw.includes(',')
    ? raw.replace(/[ \u00A0.]/g, '').replace(',', '.')
    : raw.replace(/[ \u00A0]/g, '');
  return Number.parseFloat(normalized);
}

/** Tworzy datę i odrzuca wartości niemożliwe (np. 32.13.2026). */
function makeDate(year: number, month: number, day: number): Date | null {
  const fullYear = year < 100 ? year + 2000 : year;
  if (fullYear < 2000 || fullYear > 2100) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(fullYear, month - 1, day);
  const valid =
    date.getFullYear() === fullYear &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return valid ? date : null;
}

function findDate(lines: string[]): Date | null {
  for (const line of lines) {
    // dd.mm.rrrr / dd-mm-rr / dd/mm/rrrr
    let match = line.match(/\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})\b/);
    if (match) {
      const date = makeDate(Number(match[3]), Number(match[2]), Number(match[1]));
      if (date) return date;
    }

    // rrrr-mm-dd
    match = line.match(/\b(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\b/);
    if (match) {
      const date = makeDate(Number(match[1]), Number(match[2]), Number(match[3]));
      if (date) return date;
    }
  }
  return null;
}

function amountsIn(text: string): number[] {
  return (text.match(AMOUNT_RE) ?? [])
    .map(toNumber)
    .filter((n) => Number.isFinite(n) && n > 0);
}

function findTotal(lines: string[]): number | null {
  // 1. Kwota obok słowa kluczowego (w tej samej lub następnej linii).
  for (let i = 0; i < lines.length; i++) {
    if (!TOTAL_KEYWORDS.test(lines[i])) continue;

    for (const text of [lines[i], lines[i + 1] ?? '']) {
      const amounts = amountsIn(text);
      if (amounts.length) return Math.max(...amounts);
    }
  }

  // 2. Fallback: największa kwota na paragonie.
  const all = lines.flatMap(amountsIn);
  return all.length ? Math.max(...all) : null;
}

function findStore(lines: string[]): string | null {
  // Nazwa sklepu zwykle znajduje się w pierwszych liniach paragonu.
  for (const raw of lines.slice(0, 6)) {
    const line = raw.trim().replace(/\s+/g, ' ');
    if (line.length < 3 || line.length > 40) continue;
    if (STORE_IGNORE.test(line)) continue;
    if (/\d{4,}/.test(line)) continue; // NIP, numer paragonu, rok
    if (amountsIn(line).length) continue;
    if (!/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(line)) continue;
    return line;
  }
  return null;
}

/** Zwraca rozpoznane pola; brakujące pozostają `null`. */
export function parseReceipt(lines: string[]): ParsedReceipt {
  return {
    date: findDate(lines),
    total: findTotal(lines),
    store: findStore(lines),
  };
}
