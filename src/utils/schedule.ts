/**
 * HARMONOGRAM WYWOZU — logika pomocnicza dla Kalendarza Obywatelskiego.
 * ---------------------------------------------------------------------------
 * Użytkownik zapisuje dzień tygodnia per frakcja (np. "plastik w poniedziałek").
 * Tutaj liczymy, kiedy wypada NAJBLIŻSZY wywóz, żeby pokazać go na kokpicie
 * i podpowiedzieć, czy jutro trzeba wystawić pojemniki.
 */
import type { WasteScheduleEntry } from '@/types';
import { startOfToday } from './dates';

export interface NextPickup {
  entry: WasteScheduleEntry;
  /** Ile dni od dziś (0 = dziś, 1 = jutro). */
  daysAhead: number;
}

/**
 * Znajdź najbliższy wywóz względem dzisiejszego dnia.
 * Gdy kilka frakcji wypada tego samego dnia, zwracamy pierwszą napotkaną.
 */
export function nextPickup(schedule: WasteScheduleEntry[]): NextPickup | null {
  if (schedule.length === 0) return null;
  const todayDow = new Date(startOfToday()).getDay();

  let best: NextPickup | null = null;
  for (const entry of schedule) {
    // Dni do najbliższego wystąpienia tego dnia tygodnia (0 = dziś).
    const daysAhead = (entry.weekday - todayDow + 7) % 7;
    if (!best || daysAhead < best.daysAhead) {
      best = { entry, daysAhead };
    }
  }
  return best;
}

/** Wszystkie frakcje odbierane danego dnia (przydatne, gdy w jeden dzień jest kilka). */
export function wasteTypesForWeekday(
  schedule: WasteScheduleEntry[],
  weekday: number
): WasteScheduleEntry[] {
  return schedule.filter((e) => e.weekday === weekday);
}
