import { Perk } from '@/types';

export const BUNDLE_DISCOUNT_RATE = 0.1;
export const BUNDLE_MIN_PERKS_FOR_DISCOUNT = 2;

export type BundleLineItem = {
  perkId: string;
  title: string;
  providerName: string;
  originalPriceAll: number;
  discountedPriceAll: number;
};

export function computeBundlePricing(perks: Perk[]): { items: BundleLineItem[]; totalAll: number; discountApplied: boolean } {
  const discountApplied = perks.length >= BUNDLE_MIN_PERKS_FOR_DISCOUNT;
  const items: BundleLineItem[] = perks.map((perk) => ({
    perkId: perk.id,
    title: perk.title,
    providerName: perk.providerName,
    originalPriceAll: perk.priceAll,
    discountedPriceAll: discountApplied ? Math.round(perk.priceAll * (1 - BUNDLE_DISCOUNT_RATE)) : perk.priceAll,
  }));
  const totalAll = items.reduce((sum, item) => sum + item.discountedPriceAll, 0);
  return { items, totalAll, discountApplied };
}
