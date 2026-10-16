/**
 * METADANE KATEGORII PARAGONÓW.
 * ---------------------------------------------------------------------------
 * Jedno źródło prawdy o kategoriach: etykieta po polsku, ikona i kolor.
 * Dzięki temu lista, szczegóły i formularz wyglądają spójnie.
 */
import type { Ionicons } from '@expo/vector-icons';
import type { ReceiptCategory } from '@/types';
import { colors } from '@/theme/colors';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface ReceiptCategoryMeta {
  value: ReceiptCategory;
  label: string;
  icon: IoniconName;
  color: string;
}

export const RECEIPT_CATEGORIES: ReceiptCategoryMeta[] = [
  { value: 'spozywcze', label: 'Spożywcze', icon: 'cart', color: colors.success },
  { value: 'rtv_agd', label: 'RTV / AGD', icon: 'tv', color: '#3182CE' },
  { value: 'paliwo', label: 'Paliwo', icon: 'car', color: '#DD6B20' },
  { value: 'zdrowie', label: 'Zdrowie', icon: 'medkit', color: '#D53F8C' },
  { value: 'ubrania', label: 'Ubrania', icon: 'shirt', color: '#805AD5' },
  { value: 'inne', label: 'Inne', icon: 'pricetag', color: colors.textSecondary },
];

/** Szybki dostęp do meta po wartości kategorii. */
export function getCategoryMeta(category: ReceiptCategory): ReceiptCategoryMeta {
  return RECEIPT_CATEGORIES.find((c) => c.value === category) ?? RECEIPT_CATEGORIES[5];
}
