/**
 * NARZĘDZIA DAT I FORMATOWANIA — polskie locale, operacje na datach.
 * ---------------------------------------------------------------------------
 * Wszystkie daty w aplikacji to timestampy (ms). Tutaj konwertujemy je
 * do czytelnych stringów po polsku i liczymy terminy (np. koniec gwarancji).
 */

/** Data dziś, z przycięciem do początku dnia (00:00). */
export function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Dodaj `months` miesięcy do daty — używane do liczenia końca gwarancji. */
export function addMonths(date: number, months: number): number {
  const d = new Date(date);
  const targetDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Zabezpieczenie: 31 stycznia + 1 miesiąc = 28/29 lutego (RN Date sam przesuwa)
  if (d.getDate() < targetDay) {
    d.setDate(0); // cofnij do ostatniego dnia poprzedniego miesiąca
  }
  d.setHours(23, 59, 59, 999); // koniec dnia — gwarancja ważna do końca ostatniego dnia
  return d.getTime();
}

/** Formatowanie daty: \"14 paź 2026\" (skrót miesiąca po polsku). */
export function formatDate(ts: number): string {
  const months = [
    'sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
    'lip', 'sie', 'wrz', 'paź', 'lis', 'gru',
  ];
  const d = new Date(ts);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Formatowanie godziny: \"20:00\". */
export function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

/** Kwota w PLN: 1240 -> \"1 240,00 zł\". */
export function formatCurrency(amount: number): string {
  return (
    new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
    }).format(amount)
  );
}

/** Liczba dni kalendarzowych od dziś do `ts` (może być ujemna = minęło). */
export function daysUntil(ts: number): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const today = startOfToday();
  const target = new Date(ts);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today) / msPerDay);
}

/** Klucz miesiąca (\"2026-10\") — do agregacji wydatków miesięcznych. */
export function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Polskie nazwy dni tygodnia (index = getDay(): 0 = niedziela). */
export const WEEKDAY_NAMES = [
  'niedziela',
  'poniedziałek',
  'wtorek',
  'środa',
  'czwartek',
  'piątek',
  'sobota',
] as const;

/** Dni tygodnia w kolejności startu tygodnia (pon -> niedz) — do UI. */
export const WEEKDAYS_MON_FIRST = [1, 2, 3, 4, 5, 6, 0] as const;

/** Identyfikator unikalny (nie wymaga zewnętrznej biblioteki). */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
