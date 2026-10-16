/**
 * POWIADOMIENIA — lokalne przypomnienia (bez serwera push).
 * ---------------------------------------------------------------------------
 * wg dokumentacji aplikacja przypomina o:
 *  - kończącej się gwarancji (30 dni przed)          — moduł 2
 *  - kończącym się kwicie kaucyjnym (7 dni przed)   — moduł 3
 *  - wieczornym wywozie śmieci (dzień wcześniej, 20:00) — moduł 4
 *
 * Używamy WYŁĄCZNIE powiadomień lokalnych (expo-notifications) — działają
 * offline i w Expo Go. Push zdalny wymaga dev-builda, więc w MVP jest out of scope.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { WasteType } from '@/types';

/**
 * Handler decyduje, co zrobić z powiadomieniem, gdy apka jest w foregroundzie.
 * Chcemy pokazywać banner + wpis na liście centrali powiadomień.
 * (Musi być ustawiony raz, na starcie apki — patrz src/app/_layout.tsx.)
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** ID kanału Android — bez kanału Android 13+ nie wyświetli uprawnień/powiadomień. */
const ANDROID_CHANNEL_ID = 'citizen-wallet-alerts';

/** Utwórz kanał powiadomień (Android) i poproś o uprawnienia — wołaj raz na starcie. */
export async function setupNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Przypomnienia Citizen Wallet',
      // `AndroidImportance` jest re-eksportowane przez `export *` w expo-notifications.
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007A78',
    });
  }
  return ensurePermissionsAsync();
}

/** Poproś o uprawnienia do powiadomień (zwraca true, gdy mamy zgodę). */
export async function ensurePermissionsAsync(): Promise<boolean> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  if (!canAskAgain) return false; // użytkownik zablokował w ustawieniach systemowych
  const request = await Notifications.requestPermissionsAsync();
  return request.status === 'granted';
}

/** Zaplanuj powiadomienie o konkretnej dacie/godzinie. Zwraca ID (do anulowania). */
export async function scheduleAtAsync(
  date: Date,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string | null> {
  // Termin w przeszłości nie ma sensu — pomijamy (np. gdy gwarancja już się kończy).
  if (date.getTime() <= Date.now()) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data: data ?? {}, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  } catch (err) {
    console.warn('[notifications] Nie udało się zaplanować:', err);
    return null;
  }
}

/** Anuluj pojedyncze powiadomienie po ID (bezpiecznie — ID może być nieaktualne). */
export async function cancelAsync(id: string | null | undefined): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // już anulowane/usunięte — ignorujemy
  }
}

/**
 * Przypomnienie o kończącym się gwarancji: 30 dni przed końcem, o 10:00.
 * Zwraca ID powiadomienia albo null (gdy termin już minął/brak zgody).
 */
export async function scheduleWarrantyReminderAsync(
  endDate: number,
  itemName: string,
  storeName: string
): Promise<string | null> {
  const remindAt = new Date(endDate - 30 * 24 * 60 * 60 * 1000);
  remindAt.setHours(10, 0, 0, 0);
  return scheduleAtAsync(
    remindAt,
    'Kończy się gwarancja!',
    `Za 30 dni kończy się gwarancja na: ${itemName} (${storeName}). Sprawdź, czy wszystko działa!`,
    { kind: 'warranty' }
  );
}

/** Przypomnienie o kwicie kaucyjnym: 7 dni przed utratą ważności, o 09:00. */
export async function scheduleVoucherExpiryReminderAsync(
  expiresAt: number,
  amountPln: number
): Promise<string | null> {
  const remindAt = new Date(expiresAt - 7 * 24 * 60 * 60 * 1000);
  remindAt.setHours(9, 0, 0, 0);
  return scheduleAtAsync(
    remindAt,
    'Kwit kaucyjny straci ważność',
    `Za 7 dni wygasa Twój kwit na ${amountPln.toFixed(2)} zł. Odbierz pieniądze w butelkomacie!`,
    { kind: 'voucher' }
  );
}

/** Etykiety frakcji — używane w powiadomieniach i na ekranie harmonogramu. */
export const WASTE_TYPE_LABELS: Record<WasteType, string> = {
  zmieszane: 'Odpady zmieszane',
  papier: 'Papier',
  plastik_bio: 'Plastik i bio',
  szklo: 'Szkło',
  wielkogabarytowe: 'Odpady wielkogabarytowe',
};

/**
 * Zaplanuj powtarzające się przypomnienie o wywozie — wieczór poprzedniego dnia (20:00).
 * Używamy triggera WEEKLY: wymaga `weekday` w konwencji 1 = niedziela ... 7 = sobota,
 * a my trzymamy dni w formacie JS (0 = niedziela), więc dodajemy 1.
 */
export async function scheduleWeeklyWasteReminderAsync(
  jsWeekday: number, // 0 = niedziela (format JS Date.getDay())
  wasteType: WasteType
): Promise<string | null> {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Jutro rano wywóz odpadów',
        body: `Jutro odbierane będą: ${WASTE_TYPE_LABELS[wasteType]}. Wystaw pojemniki wieczorem!`,
        data: { kind: 'waste' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        // Przypomnienie leci w DNIU wywozu o 20:00, czyli wieczór poprzedzający poranny odbiór.
        weekday: jsWeekday + 1,
        hour: 20,
        minute: 0,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  } catch (err) {
    console.warn('[notifications] Nie udało się zaplanować przypomnienia o wywozie:', err);
    return null;
  }
}

/** Anuluj WSZYSTKIE zaplanowane powiadomienia (używane przy wyłączaniu harmonogramu). */
export async function cancelAllAsync(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignorujemy
  }
}
