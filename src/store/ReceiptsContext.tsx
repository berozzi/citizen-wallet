/**
 * CONTEXT PARAGONÓW — moduł 2 (Inteligentne Paragony i Gwarancje).
 * ---------------------------------------------------------------------------
 * Odpowiada za:
 *  - CRUD paragonów (zapis offline + trwałe zdjęcia w katalogu aplikacji),
 *  - planowanie powiadomienia o końcu gwarancji (30 dni przed),
 *  - anulowanie powiadomienia i sprzątanie zdjęcia przy usunięciu paragonu,
 *  - agregacje dla UI: wydatki w miesiącu, lista pilnowanych gwarancji.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { deleteDocument, loadJsonNullable, saveJson, STORAGE_KEYS } from '@/storage/storage';
import type { Receipt, ReceiptCategory, Warranty } from '@/types';
import { addMonths, monthKey, startOfToday, uid, daysUntil } from '@/utils/dates';
import { cancelAsync, scheduleWarrantyReminderAsync } from '@/utils/notifications';

/** Dane wejściowe nowego paragonu (z formularza). */
export interface NewReceiptInput {
  storeName: string;
  date: number;
  total: number;
  category: ReceiptCategory;
  photoUri?: string | null;
  itemName?: string | null;
  warrantyMonths?: number | null; // null = nie pilnujemy gwarancji
  notes?: string | null;
}

/** Status gwarancji do wyświetlenia paska postępu. */
export interface WarrantyStatus {
  /** Procent pozostałego czasu (100 = świeżo kupione, 0 = wygasło). */
  remainingPercent: number;
  /** Dni do końca (ujemne = po terminie). */
  daysLeft: number;
  level: 'ok' | 'warning' | 'danger';
}

interface ReceiptsContextValue {
  receipts: Receipt[];
  isLoading: boolean;
  addReceipt: (input: NewReceiptInput) => Promise<Receipt>;
  updateReceipt: (id: string, patch: Partial<Receipt>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  getReceipt: (id: string) => Receipt | undefined;
  /** Paragony malejąco po dacie (najnowsze pierwsze). */
  sortedReceipts: Receipt[];
  /** Tylko paragony z przypisaną gwarancją — do zakładki \"Gwarancje\". */
  warrantyReceipts: Receipt[];
  /** Suma wydatków w danym miesiącu (domyślnie bieżącym). */
  monthlyTotal: (key?: string) => number;
  /** Status paska gwarancji dla paragonu. */
  getWarrantyStatus: (receipt: Receipt) => WarrantyStatus;
}

const ReceiptsContext = createContext<ReceiptsContextValue | null>(null);

/** Demo paragony (pierwszy start) — jeden z długą gwarancją, żeby było co pokazać. */
function seedReceipts(): Receipt[] {
  const now = Date.now();
  return [
    {
      id: uid(),
      storeName: 'Media Markt',
      date: now - 40 * 24 * 60 * 60 * 1000,
      total: 2499.0,
      category: 'rtv_agd',
      photoUri: null,
      itemName: 'Pralka Bosch',
      warranty: {
        months: 24,
        endDate: addMonths(now - 40 * 24 * 60 * 60 * 1000, 24),
        notificationId: null, // demo nie planuje powiadomienia
      },
      notes: 'Zakup na raty 0%.',
      createdAt: now,
    },
    {
      id: uid(),
      storeName: 'Biedronka',
      date: now - 3 * 24 * 60 * 60 * 1000,
      total: 132.47,
      category: 'spozywcze',
      photoUri: null,
      itemName: null,
      warranty: null,
      notes: null,
      createdAt: now,
    },
  ];
}

export function ReceiptsProvider({ children }: { children: React.ReactNode }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadJsonNullable<Receipt[]>(STORAGE_KEYS.receipts);
      const data = stored ?? seedReceipts();
      if (stored == null) await saveJson(STORAGE_KEYS.receipts, data);
      setReceipts(data);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!isLoading) void saveJson(STORAGE_KEYS.receipts, receipts);
  }, [receipts, isLoading]);

  const value = useMemo<ReceiptsContextValue>(() => {
    return {
      receipts,
      isLoading,

      addReceipt: async (input) => {
        // Gdy użytkownik pilnuje gwarancji: policz koniec okresu i zaplanuj push.
        let warranty: Warranty | null = null;
        if (input.warrantyMonths && input.warrantyMonths > 0) {
          const endDate = addMonths(input.date, input.warrantyMonths);
          const notificationId = await scheduleWarrantyReminderAsync(
            endDate,
            input.itemName?.trim() || input.storeName,
            input.storeName
          );
          warranty = { months: input.warrantyMonths, endDate, notificationId };
        }
        const receipt: Receipt = {
          id: uid(),
          storeName: input.storeName.trim() || 'Sklep',
          date: input.date,
          total: input.total,
          category: input.category,
          photoUri: input.photoUri ?? null,
          itemName: input.itemName?.trim() || null,
          warranty,
          notes: input.notes?.trim() || null,
          createdAt: Date.now(),
        };
        setReceipts((prev) => [receipt, ...prev]);
        return receipt;
      },

      updateReceipt: async (id, patch) => {
        setReceipts((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      },

      deleteReceipt: async (id) => {
        const receipt = receipts.find((r) => r.id === id);
        // Sprzątanie po paragonie: anuluj powiadomienie i usuń zdjęcie z dysku.
        await cancelAsync(receipt?.warranty?.notificationId);
        if (receipt?.photoUri) await deleteDocument(receipt.photoUri);
        setReceipts((prev) => prev.filter((r) => r.id !== id));
      },

      getReceipt: (id) => receipts.find((r) => r.id === id),

      sortedReceipts: [...receipts].sort((a, b) => b.date - a.date),

      warrantyReceipts: [...receipts]
        .filter((r) => !!r.warranty)
        .sort((a, b) => (a.warranty!.endDate ?? 0) - (b.warranty!.endDate ?? 0)),

      monthlyTotal: (key) => {
        const target = key ?? monthKey(startOfToday());
        return receipts
          .filter((r) => monthKey(r.date) === target)
          .reduce((sum, r) => sum + r.total, 0);
      },

      getWarrantyStatus: (receipt) => {
        if (!receipt.warranty) {
          return { remainingPercent: 0, daysLeft: 0, level: 'danger' };
        }
        const totalDays = Math.max(
          1,
          Math.round((receipt.warranty.endDate - receipt.date) / (24 * 60 * 60 * 1000))
        );
        const left = daysUntil(receipt.warranty.endDate);
        const remainingPercent = Math.max(0, Math.min(100, Math.round((left / totalDays) * 100)));
        // Kolory paska: zielony > 60 dni, pomarańczowy 30-60, czerwony < 30 dni.
        const level: WarrantyStatus['level'] = left < 30 ? 'danger' : left < 60 ? 'warning' : 'ok';
        return { remainingPercent, daysLeft: left, level };
      },
    };
  }, [receipts, isLoading]);

  return <ReceiptsContext.Provider value={value}>{children}</ReceiptsContext.Provider>;
}

/** Hook dostępu do paragonów. */
export function useReceipts(): ReceiptsContextValue {
  const ctx = useContext(ReceiptsContext);
  if (!ctx) throw new Error('useReceipts musi być użyty wewnątrz <ReceiptsProvider>');
  return ctx;
}
