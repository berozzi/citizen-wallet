/**
 * WARSTWA PERSISTENCJI — cienki wrapper na AsyncStorage.
 * ---------------------------------------------------------------------------
 * Cały portfel działa OFFLINE: karty, paragony, kwity i ustawienia leżą
 * lokalnie w pamięci urządzenia. Klucze trzymamy w jednym miejscu (STORAGE_KEYS),
 * a zapis jest \"natychmiastowy\" po każdej mutacji (wywoływany z Contextów).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
// SDK 57 udostępnia nowe, obiektowe API plików (klasy File/Directory/Paths).
// Import legacy jest dostępny pod 'expo-file-system/legacy' — my używamy nowego.
import { Directory, File, Paths } from 'expo-file-system';

/** Klucze storage — jeden rejestr, żeby nie dublować literówek. */
export const STORAGE_KEYS = {
  cards: '@citizen-wallet/cards',
  receipts: '@citizen-wallet/receipts',
  vouchers: '@citizen-wallet/vouchers',
  settings: '@citizen-wallet/settings',
} as const;

/** Odczytaj JSON z storage; w razie braku/usterek zwróć `fallback`. */
export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  const value = await loadJsonNullable<T>(key);
  return value === null ? fallback : value;
}

/**
 * Odczytaj JSON zwracajacy `null`, gdy klucza NIE MA (inne błędy też => null).
 * Przydatne do wykrycia \"pierwszego uruchomienia\" (seed danych demo).
 */
export async function loadJsonNullable<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[storage] Nie udało się odczytać ${key}:`, err);
    return null;
  }
}

/** Zapisz obiekt jako JSON (nadpisuje). */
export async function saveJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] Nie udało się zapisać ${key}:`, err);
  }
}

/** Usuń wpod pod kluczem. */
export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] Nie udało się usunąć ${key}:`, err);
  }
}

/**
 * Trwała kopia zdjęcia paragonu.
 * URI zwrócone przez aparat/gallery są TYMCZASOWE (cache) — kasują się przy
 * starcie systemu, więc kopiujemy je do trwałego katalogu aplikacji.
 */
export async function copyToDocuments(sourceUri: string, fileName: string): Promise<string> {
  // Katalog trwały na zdjęcia paragonów: <documentDirectory>/receipts/
  const dir = new Directory(Paths.document, 'receipts');
  if (!dir.exists) {
    dir.create(); // tworzymy raz; błąd (np. brak miejsca) przeleci do catch poniżej
  }
  const destination = new File(dir, fileName);
  const source = new File(sourceUri); // URI z aparat/gallery (plik tymczasowy w cache)
  await source.copy(destination); // async (Promise<void>) — czekamy, żeby plik nie wrócił „na sucho"
  return destination.uri;
}

/** Usuń trwałe zdjęcie (przy kasowaniu paragonu). */
export async function deleteDocument(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // plik mógł już nie istnieć — ignorujemy
  }
}
