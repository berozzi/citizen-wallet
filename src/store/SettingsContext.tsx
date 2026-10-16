/**
 * CONTEXT USTAWIEŃ — imię, adres i harmonogram wywozu śmieci (moduł 4).
 * ---------------------------------------------------------------------------
 * Tu mieszka logika Kalendarza Obywatelskiego:
 *  - użytkownik podaje adres i wskazuje dni wywozu per frakcja,
 *  - zapisujemy harmonogram i (jeśli włączone) planujemy cotygodniowe
 *    przypomnienia o 20:00 w dniu wywozu (wieczór przed porannym odbiorem),
 *  - przy zmianie harmonogramu najpierw anulujemy stare powiadomienia.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadJsonNullable, saveJson, STORAGE_KEYS } from '@/storage/storage';
import { DEFAULT_SETTINGS, type UserSettings, type WasteScheduleEntry } from '@/types';
import { cancelAsync, scheduleWeeklyWasteReminderAsync } from '@/utils/notifications';

interface SettingsContextValue {
  settings: UserSettings;
  isLoading: boolean;
  /** Zapisz częściowe zmiany ustawień (np. tylko imię albo tylko harmonogram). */
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  /**
   * Zapisz harmonogram i (re)zaplanuj powiadomienia.
   * Gdy `remindersEnabled` jest false — tylko zapisujemy dane, bez powiadomień.
   */
  saveSchedule: (address: string, schedule: WasteScheduleEntry[], remindersEnabled: boolean) => Promise<void>;
  /** Włącz/wyłącz przypomnienia bez zmiany harmonogramu. */
  setRemindersEnabled: (enabled: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadJsonNullable<UserSettings>(STORAGE_KEYS.settings);
      setSettings(stored ?? DEFAULT_SETTINGS);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!isLoading) void saveJson(STORAGE_KEYS.settings, settings);
  }, [settings, isLoading]);

  const value = useMemo<SettingsContextValue>(() => {
    /** Anuluj wszystkie zapisane ID-tki przypomnień o wywozie. */
    const clearWasteNotifications = async (ids: string[]) => {
      for (const id of ids) await cancelAsync(id);
    };

    /** Zaplanuj po jednym cotygodniowym przypomnieniu na każdą frakcję. */
    const scheduleWasteNotifications = async (schedule: WasteScheduleEntry[]) => {
      const ids: string[] = [];
      for (const entry of schedule) {
        const id = await scheduleWeeklyWasteReminderAsync(entry.weekday, entry.wasteType);
        if (id) ids.push(id);
      }
      return ids;
    };

    return {
      settings,
      isLoading,

      updateSettings: async (patch) => {
        setSettings((prev) => ({ ...prev, ...patch }));
      },

      saveSchedule: async (address, schedule, remindersEnabled) => {
        // 1) Zawsze najpierw czyścimy stare przypomnienia (żeby nie dublować).
        await clearWasteNotifications(settings.wasteNotificationIds);
        // 2) Planujemy nowe tylko, gdy użytkownik chce przypomnienia.
        const ids = remindersEnabled ? await scheduleWasteNotifications(schedule) : [];
        setSettings((prev) => ({
          ...prev,
          address,
          schedule,
          wasteRemindersEnabled: remindersEnabled,
          wasteNotificationIds: ids,
        }));
      },

      setRemindersEnabled: async (enabled) => {
        if (!enabled) {
          await clearWasteNotifications(settings.wasteNotificationIds);
          setSettings((prev) => ({ ...prev, wasteRemindersEnabled: false, wasteNotificationIds: [] }));
          return;
        }
        const ids = await scheduleWasteNotifications(settings.schedule);
        setSettings((prev) => ({
          ...prev,
          wasteRemindersEnabled: true,
          wasteNotificationIds: ids,
        }));
      },
    };
  }, [settings, isLoading]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** Hook dostępu do ustawień. */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings musi być użyty wewnątrz <SettingsProvider>');
  return ctx;
}
