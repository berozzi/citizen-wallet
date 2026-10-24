/**
 * PLIKOWY DZIENNIK ZESKANOWANYCH KODÓW (barcodes.json / barcodes.txt)
 * ---------------------------------------------------------------------------
 * Tu kod kreskowy NAPRAWDĘ trafia do pliku na dysku telefonu — nie tylko do
 * AsyncStorage. Zapisujemy dwa pliki w katalogu dokumentów aplikacji:
 *
 *   1. `barcodes.json` — tablica obiektów `ScannedBarcode` (JSON). Można ją
 *      wczytać (`JSON.parse`) i „zdeserializować" z powrotem do obiektów.
 *   2. `barcodes.txt`  — ten sam dziennik w formie czytelnej dla człowieka,
 *      jedna linia = jeden skan: `ISO-data<TAB>format<TAB>źródło<TAB>kod`.
 *
 * Pliki są trwałe (katalog `Paths.document` nie jest czyszczony przez system)
 * i przeżywają restart aplikacji.
 *
 * API plików w SDK 57 (nowe, obiektowe):
 *   - `file.write(text): void`     → synchroniczny zapis (tworzy plik),
 *   - `await file.text(): string`  → asynchroniczny odczyt zawartości,
 *   - `file.exists`, `file.delete()`.
 */
import { File, Paths } from 'expo-file-system';
import type { ScannedBarcode } from '@/types';
import { uid } from '@/utils/dates';

/** Nazwy plików w katalogu dokumentów aplikacji. */
export const BARCODES_JSON_FILE = 'barcodes.json';
export const BARCODES_TXT_FILE = 'barcodes.txt';

/** Dane wejściowe do zapisania skanu (reszta pól jest uzupełniana tutaj). */
export interface NewScannedBarcode {
  /** Treść kodu odczytana ze skanera. */
  value: string;
  /** Typ kodu, np. 'ean13' / 'qr' / 'code128'. */
  format: string;
  /** Źródło: 'karta' (portfel) lub 'kwit' (eko-zwroty). */
  source: string;
  /** Opcjonalna etykieta (np. nazwa sklepu). */
  label?: string | null;
}

/** Uchwyt do pliku JSON (obiekt `File`, ścieżka w katalogu dokumentów). */
function jsonFile(): File {
  return new File(Paths.document, BARCODES_JSON_FILE);
}

/** Uchwyt do pliku TXT (czytelny dziennik). */
function txtFile(): File {
  return new File(Paths.document, BARCODES_TXT_FILE);
}

/** Informacje o plikach dziennika — do pokazania na ekranie (defensywnie). */
export interface BarcodesFileInfo {
  jsonUri: string;
  txtUri: string;
  jsonExists: boolean;
  txtExists: boolean;
  /** Rozmiar pliku JSON w bajtach (0, gdy plik nie istnieje / błąd). */
  jsonSize: number;
}

/** Zebierz informacje o plikach dziennika (bezpiecznie — nigdy nie rzuca). */
export function barcodesFileInfo(): BarcodesFileInfo {
  try {
    const json = jsonFile();
    const txt = txtFile();
    return {
      jsonUri: json.uri,
      txtUri: txt.uri,
      jsonExists: json.exists,
      txtExists: txt.exists,
      jsonSize: json.exists ? (json.size ?? 0) : 0,
    };
  } catch (err) {
    console.warn('[barcodeFile] Nie udało się odczytać informacji o plikach:', err);
    return {
      jsonUri: BARCODES_JSON_FILE,
      txtUri: BARCODES_TXT_FILE,
      jsonExists: false,
      txtExists: false,
      jsonSize: 0,
    };
  }
}

/**
 * Odczytaj i ZDESERIALIZUJ dziennik skanów z pliku JSON.
 * Zwraca pustą tablicę, gdy plik nie istnieje albo jest uszkodzony.
 */
export async function readScannedBarcodes(): Promise<ScannedBarcode[]> {
  try {
    const file = jsonFile();
    if (!file.exists) return [];
    const raw = await file.text(); // SDK 57: async, zwraca string
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScannedBarcode[]) : [];
  } catch (err) {
    console.warn('[barcodeFile] Nie udało się odczytać dziennika skanów:', err);
    return [];
  }
}

/**
 * Dopisz nowy skan na KOŃCU dziennika (porządek chronologiczny) i zapisz oba
 * pliki. Zwraca utworzony wpis.
 */
export async function appendScannedBarcode(input: NewScannedBarcode): Promise<ScannedBarcode> {
  const record: ScannedBarcode = {
    id: uid(),
    value: input.value,
    format: input.format,
    source: input.source,
    label: input.label ?? null,
    scannedAt: Date.now(),
  };
  const existing = await readScannedBarcodes();
  await writeScannedBarcodes([...existing, record]);
  return record;
}

/**
 * Zapisz cały dziennik do plików (nadpisuje). `write()` jest synchroniczne i
 * samo tworzy plik, jeśli go nie ma.
 */
export async function writeScannedBarcodes(list: ScannedBarcode[]): Promise<void> {
  try {
    jsonFile().write(JSON.stringify(list, null, 2));
    txtFile().write(renderTxt(list));
  } catch (err) {
    console.warn('[barcodeFile] Nie udało się zapisać dziennika skanów:', err);
  }
}

/** Usuń oba pliki dziennika (czyszczenie z UI). */
export async function clearScannedBarcodes(): Promise<void> {
  try {
    const json = jsonFile();
    if (json.exists) json.delete();
    const txt = txtFile();
    if (txt.exists) txt.delete();
  } catch (err) {
    console.warn('[barcodeFile] Nie udało się wyczyścić dziennika skanów:', err);
  }
}

/** Zamień listę wpisów na czytelny tekst (jedna linia = jeden skan). */
function renderTxt(list: ScannedBarcode[]): string {
  const header = `# Citizen Wallet — dziennik kodów (${list.length})\n`;
  const lines = list.map((r) => {
    const date = new Date(r.scannedAt).toISOString();
    const label = r.label ? `\t${r.label}` : '';
    return `${date}\t${r.format}\t${r.source}\t${r.value}${label}`;
  });
  return header + (lines.length ? lines.join('\n') + '\n' : '');
}

/**
 * Usuń z dziennika skanów wpisy o podanej wartości kodu.
 * Używane przy usuwaniu karty — żeby jej ślad zniknął też z barcodes.json/.txt.
 * Zwraca liczbę usuniętych wpisów (0, gdy nic nie pasowało).
 */
export async function removeScannedBarcodeByValue(value: string): Promise<number> {
  const v = value.trim();
  if (!v) return 0;
  const list = await readScannedBarcodes();
  const filtered = list.filter((b) => b.value.trim() !== v);
  const removed = list.length - filtered.length;
  if (removed > 0) {
    await writeScannedBarcodes(filtered);
  }
  return removed;
}
