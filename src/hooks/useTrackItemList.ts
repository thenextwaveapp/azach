import { useEffect, useRef } from "react";
import type { Product } from "@/types/product";
import { getDisplayPriceAmount } from "@/utils/productHelpers";
import { trackViewItemList, type AnalyticsItem } from "@/lib/analytics";

type GetPriceFn = (
  product: { price: number; original_price?: number; currency_prices?: Product["currency_prices"] },
  tier?: "price" | "original_price"
) => { amount: number; currency: string } | null;

/** Fires view_item_list once per distinct product set on a listing page. */
export function useTrackItemList(
  listName: string,
  products: Product[],
  getPrice: GetPriceFn,
  currency: string,
  isLoading: boolean
) {
  const lastKey = useRef("");

  useEffect(() => {
    if (isLoading || products.length === 0) return;

    const key = products.map((p) => p.id).join(",");
    if (key === lastKey.current) return;
    lastKey.current = key;

    const items: AnalyticsItem[] = products.map((p) => ({
      item_id: String(p.id),
      item_name: p.name,
      price: getDisplayPriceAmount(p, getPrice),
      item_category: p.category,
    }));

    trackViewItemList(listName, items, currency);
  }, [listName, products, getPrice, currency, isLoading]);
}
