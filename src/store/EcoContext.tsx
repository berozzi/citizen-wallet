/**
 * CONTEXT EKO — moduł 3 (Eko-Zwroty i Butelkomaty).
 * ---------------------------------------------------------------------------
 * Przechowuje kwity kaucyjne z butelkomatów:
 *  - zapisuje kwotę i datę ważności (żeby kupon nie przepadł),
 *  - planuje przypomnienie 7 dni przed wygaśnięciem,
 *  - liczy licznik recyklingowy dla kokpitu (ile zwróconych butelek i kwota).
 *
 * Liczbę butelek szacujemy z kwoty kaucji (1 butelka = 0,50 zł) — zgodnie
 * z polskim systemem kaucyjnym. W przyszłości pole przyjdzie z API butelkomatu.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadJsonNullable, saveJson, STORAGE_KEYS } from '@/storage/storage';
import type { DepositVoucher } from '@/types';
import { startOfToday, uid, daysUntil } from '@/utils/dates';
import { cancelAsync, scheduleVoucherExpiryReminderAsync } from '@/utils/notifications';

/** Kaucja za jedną butelkę w systemie kaucyjnym (PL). */
export const DEPOSIT_PER_UNIT_PLN = 0.5;

/** Domyślny okres ważności kwitu z butelkomatu (rok). */
export const VOUCHER_VALIDITY_MONTHS = 12;

export interface NewVoucherInput {
  amount: number;
  issuedAt: number;
  expiresAt: number;
  code?: string | null;
}

interface EcoContextValue {
  vouchers: DepositVoucher[];
  isLoading: boolean;
  addVoucher: (input: NewVoucherInput) => Promise<DepositVoucher>;
  deleteVoucher: (id: string) => Promise<void>;
  /** Aktywne (nieważygłe) kwity — sortowane po dacie ważności. */
  activeVouchers: DepositVoucher[];
  /** Łączna kwota do odebrania z ważnych kwitów. */
  pendingValue: number;
  /** Łączna liczba zwróconych butelek (liczona ze wszystkich kwitów). */
  bottlesReturned: number;
  /** Czy jest kwit, który wygasa w ciągu 7 dni (alert na kokpicie). */
  expiringVouchers: DepositVoucher[];
}

const EcoContext = createContext<EcoContextValue | null>(null);

/** Demo kwit na pierwszy start — pokazuje licznik eko na kokpicie. */
function seedVouchers(): DepositVoucher[] {
  const now = Date.now();
  return [
    {
      id: uid(),
      amount: 12.0, // 24 butelki × 0,50 zł
      issuedAt: now - 10 * 24 * 60 * 60 * 1000,
      expiresAt: now + 355 * 24 * 60 * 60 * 1000,
      code: 'KAUCJA-2026-0001',
      notificationId: null,
    },
    {
      id: uid(),
      amount: 4.5, // 9 butelek
      issuedAt: now - 300 * 24 * 60 * 60 * 1000,
      expiresAt: now + 5 * 24 * 60 * 60 * 1000, // wygasa za 5 dni → alert!
      code: 'KAUCJA-2025-8842',
      notificationId: null,
    },
  ];
}

export function EcoProvider({ children }: { children: React.ReactNode }) {
  const [vouchers, setVouchers] = useState<DepositVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadJsonNullable<DepositVoucher[]>(STORAGE_KEYS.vouchers);
      const data = stored ?? seedVouchers();
      if (stored == null) await saveJson(STORAGE_KEYS.vouchers, data);
      setVouchers(data);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!isLoading) void saveJson(STORAGE_KEYS.vouchers, vouchers);
  }, [vouchers, isLoading]);

  const value = useMemo<EcoContextValue>(() => {
    const active = vouchers
      .filter((v) => v.expiresAt > startOfToday())
      .sort((a, b) => a.expiresAt - b.expiresAt);

    return {
      vouchers,
      isLoading,

      addVoucher: async (input) => {
        // Od razu planujemy przypomnienie o wygasaniu (7 dni przed).
        const notificationId = await scheduleVoucherExpiryReminderAsync(
          input.expiresAt,
          input.amount
        );
        const voucher: DepositVoucher = {
          id: uid(),
          amount: input.amount,
          issuedAt: input.issuedAt,
          expiresAt: input.expiresAt,
          code: input.code ?? null,
          notificationId,
        };
        setVouchers((prev) => [voucher, ...prev]);
        return voucher;
      },

      deleteVoucher: async (id) => {
        const voucher = vouchers.find((v) => v.id === id);
        await cancelAsync(voucher?.notificationId);
        setVouchers((prev) => prev.filter((v) => v.id !== id));
      },

      activeVouchers: active,
      pendingValue: active.reduce((sum, v) => sum + v.amount, 0),
      // Szacujemy butelki z kwoty kaucji — 1 szt. = 0,50 zł.
      bottlesReturned: Math.round(vouchers.reduce((sum, v) => sum + v.amount, 0) / DEPOSIT_PER_UNIT_PLN),
      expiringVouchers: active.filter((v) => daysUntil(v.expiresAt) <= 7),
    };
  }, [vouchers, isLoading]);

  return <EcoContext.Provider value={value}>{children}</EcoContext.Provider>;
}

/** Hook dostępu do danych eko. */
export function useEco(): EcoContextValue {
  const ctx = useContext(EcoContext);
  if (!ctx) throw new Error('useEco musi być użyty wewnątrz <EcoProvider>');
  return ctx;
}
