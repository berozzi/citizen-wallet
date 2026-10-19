/**
 * TYPY DOMENOWE — serce modelu danych aplikacji.
 * ---------------------------------------------------------------------------
 * Wszystkie encje przechowujemy lokalnie (AsyncStorage) — aplikacja ma
 * działać BŁYSKAWICZNIE i OFFLINE (priorytet 🥇 wg dokumentacji).
 * Daty trzymamy jako timestampy (ms od epoki) — łatwo sortować/porównywać.
 */

/** Format kodu drukowanego na karcie (do ekranu kasowego). */
export type BarcodeFormat = 'code128' | 'ean13' | 'qr' | 'unknown';

/** Karta lojalnościowa (moduł 1 — Wirtualny Portfel Kart). */
export interface LoyaltyCard {
  id: string; // UUID generowany w runtime
  /** Etykieta nadana przez użytkownika, np. \"Moja Biedronka\". */
  name: string;
  /** Nazwa sklepu (z katalogu marek lub własna). */
  storeName: string;
  /** Klucz marki z katalogu (np. 'biedronka') — do automatycznego koloru/logo. */
  brandId?: string | null;
  /** Kolor kafelka (kolor marki, np. granat Lidla). */
  color: string;
  /** Kolor tekstu na kolorze kafelka (biały lub grafit — dla kontrastu). */
  textColor: string;
  /** Surowy ciąg odczytany ze skanera (np. \"1234567890123\"). */
  barcodeValue: string;
  /** Format kodu — determines how it is rendered on the checkout screen. */
  barcodeFormat: BarcodeFormat;
  createdAt: number;
  /** Ile razy karta została otwarta \"na kasie\" — do sekcji \"Używane najczęściej\". */
  useCount: number;
  /** Ostatnie użycie (timestamp) — do sortowania najczęściej używanych. */
  lastUsedAt: number | null;
}

/** Kategorie paragonów — determinują ikonkę na liście. */
export type ReceiptCategory =
  | 'spozywcze'
  | 'rtv_agd'
  | 'paliwo'
  | 'zdrowie'
  | 'ubrania'
  | 'inne';

/** Informacja o gwarancji przypisana do paragonu (moduł 2). */
export interface Warranty {
  /** Długość gwarancji w miesiącach (np. 24). */
  months: number;
  /** Data końca gwarancji (purchaseDate + months) — liczona automatycznie. */
  endDate: number;
  /** ID zaplanowanej lokalnej powiadomienia (30 dni przed końcem), jeśli jest. */
  notificationId: string | null;
}

/** Paragon zakupu (moduł 2 — Inteligentne Paragony i Gwarancje). */
export interface Receipt {
  id: string;
  /** Nazwa sklepu (z OCR lub wpisana ręcznie). */
  storeName: string;
  /** Data zakupu (timestamp, początek dnia). */
  date: number;
  /** Kwota łączna w PLN. */
  total: number;
  category: ReceiptCategory;
  /** Lokalny URI zdjęcia paragonu (kopia w katalogu aplikacji — patrz storage.ts). */
  photoUri?: string | null;
  /** Nazwa produktu — potrzebna do czytelnego powiadomienia o gwarancji. */
  itemName?: string | null;
  /** Gwarancja albo null ( zwykły paragon bez pilnowania ). */
  warranty?: Warranty | null;
  notes?: string | null;
  createdAt: number;
}

/** Kwit kaucyjny z butelkomatu (moduł 3 — Eko-Zwroty). */
export interface DepositVoucher {
  id: string;
  /** Kwota kaucji do odebrania, np. 15.00 zł. */
  amount: number;
  /** Data wydania kwitu. */
  issuedAt: number;
  /** Data ważności kwitu — typowo rok; przypominamy 7 dni przed. */
  expiresAt: number;
  /** Odczytany kod z kwitu (jeśli użytkownik zeskanował QR/kod). */
  code?: string | null;
  /** ID zaplanowanego powiadomienia o kończącym się terminie. */
  notificationId: string | null;
}

/** Typ frakcji odbieranej w harmonogramie (moduł 4 — Kalendarz Obywatelski). */
export type WasteType = 'zmieszane' | 'papier' | 'plastik_bio' | 'szklo' | 'wielkogabarytowe';

/** Harmonogram wywozu śmieci — jeden wpis = jeden dzień tygodnia. */
export interface WasteScheduleEntry {
  /** Dzień tygodnia w formacie JS: 0 = niedziela ... 6 = sobota. */
  weekday: number;
  wasteType: WasteType;
}

/** Ustawienia użytkownika + jego harmonogram. */
export interface UserSettings {
  /** Imię do powitania na kokpicie (np. \"Jan\"). */
  userName: string;
  /** Adres — baza harmonogramu wywozu śmieci. */
  address: string;
  /** Czy powiadomienia o wywozie są włączone. */
  wasteRemindersEnabled: boolean;
  /** Zaplanowane ID-tki powiadomień o wywozie (żeby móc je anulować). */
  wasteNotificationIds: string[];
  /** Aktywny harmonogram (pusty, jeśli użytkownik jeszcze go nie ustawił). */
  schedule: WasteScheduleEntry[];
}

/** Słownik ustawień domyślnych. */
export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Jan',
  address: '',
  wasteRemindersEnabled: false,
  wasteNotificationIds: [],
  schedule: [],
};

/** Metadane punktu zbiórki (butelkomat / PSZOK / elektrośmieci). */
export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  kind: 'butelkomat' | 'pszok' | 'elektrosmieci';
  latitude: number;
  longitude: number;
  /** Godziny otwarcia (opis tekstowy — wystarczający dla MVP). */
  hours: string;
}

/**
 * Zeskanowany kod kreskowy / QR — wpis w PLIKOWYM dzienniku skanów.
 * ---------------------------------------------------------------------------
 * W odróżnieniu od `LoyaltyCard` (które trafiają do AsyncStorage), te wpisy
 * lądują w prawdziwym pliku na dysku: `barcodes.json` (+ kopia czytelna dla
 * człowieka `barcodes.txt`) w katalogu dokumentów aplikacji. Dzięki temu kod
 * można odczytać, skopiować czy zdeserializować poza aplikacją.
 */
export interface ScannedBarcode {
  id: string;
  /** Surowa treść odczytana ze skanera, np. \"2401234567890\". */
  value: string;
  /** Typ kodu zwrócony przez kamerę, np. 'ean13', 'qr', 'code128'. */
  format: string;
  /** Skąd pochodzi skan: 'karta' (moduł 1) albo 'kwit' (moduł 3). */
  source: string;
  /** Opcjonalna etykieta (np. nazwa sklepu), jeśli była znana w chwili skanu. */
  label: string | null;
  /** Moment zeskanowania (timestamp ms). */
  scannedAt: number;
}
