/**
 * GA4 loads unconditionally on every page load, gated by Consent Mode's default-denied
 * state (declared in index.html) rather than by whether the script itself loads — bundling
 * a consent "update" into the same tick as the first "config" call for a not-yet-registered
 * destination causes gtag.js to silently drop the update. Meta Pixel has no consent-mode
 * equivalent, so it still only loads after the visitor accepts.
 */

import { isNaijaSite } from "@/contexts/CurrencyContext";

// azach.ng and azach.ca are separate GA4 properties/streams — pick the one for the
// domain actually being viewed, same domain split already used for currency.
const GA_MEASUREMENT_ID = isNaijaSite()
  ? (import.meta.env.VITE_GA_MEASUREMENT_ID_NG as string | undefined)
  : (import.meta.env.VITE_GA_MEASUREMENT_ID_CA as string | undefined);
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

// window.gtag is defined exactly once, in index.html, before this module ever runs —
// call that single instance rather than redefining it here.
const gtag = (window as any).gtag;

let gaInitialized = false;

function initGoogleAnalytics(measurementId: string) {
  if (gaInitialized) return;
  gaInitialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", measurementId);
}

export function grantAnalyticsConsent(): void {
  gtag("consent", "update", {
    ad_storage: "granted",
    analytics_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  });
}

export function revokeAnalyticsConsent(): void {
  gtag("consent", "update", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

if (GA_MEASUREMENT_ID) initGoogleAnalytics(GA_MEASUREMENT_ID);

function loadMetaPixel(pixelId: string) {
  const w = window as any;
  if (w.fbq) return;
  w.fbq = function (...args: unknown[]) {
    w.fbq.callMethod ? w.fbq.callMethod(...args) : w.fbq.queue.push(args);
  };
  w._fbq = w._fbq || w.fbq;
  w.fbq.push = w.fbq;
  w.fbq.loaded = true;
  w.fbq.version = "2.0";
  w.fbq.queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  w.fbq("init", pixelId);
  w.fbq("track", "PageView");
}

let consentGranted = false;

export function loadAnalytics(): void {
  if (!consentGranted) {
    consentGranted = true;
    grantAnalyticsConsent();
  }
  if (META_PIXEL_ID) loadMetaPixel(META_PIXEL_ID);
}

export interface AnalyticsItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
}

function itemsValue(items: AnalyticsItem[]): number {
  return items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
}

// No-ops until loadAnalytics() has run (i.e. the visitor accepted cookies), since
// gtag/fbq aren't defined on window before then.
function gtagEvent(name: string, params: Record<string, unknown>) {
  const gtag = (window as any).gtag;
  if (typeof gtag === "function") gtag("event", name, params);
}

function fbqEvent(name: string, params: Record<string, unknown>) {
  const fbq = (window as any).fbq;
  if (typeof fbq === "function") fbq("track", name, params);
}

export function trackViewItem(item: AnalyticsItem, currency: string) {
  gtagEvent("view_item", { currency, value: item.price, items: [item] });
  fbqEvent("ViewContent", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: item.item_category,
    value: item.price,
    currency,
  });
}

export function trackViewItemList(listName: string, items: AnalyticsItem[], currency: string) {
  if (items.length === 0) return;
  gtagEvent("view_item_list", {
    item_list_id: listName,
    item_list_name: listName,
    currency,
    value: itemsValue(items),
    items,
  });
}

export function trackSelectItem(listName: string, item: AnalyticsItem, currency: string) {
  gtagEvent("select_item", {
    item_list_id: listName,
    item_list_name: listName,
    currency,
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(item: AnalyticsItem, currency: string) {
  const value = item.price * (item.quantity ?? 1);
  gtagEvent("add_to_cart", { currency, value, items: [item] });
  fbqEvent("AddToCart", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: item.item_category,
    value,
    currency,
  });
}

export function trackRemoveFromCart(item: AnalyticsItem, currency: string) {
  const value = item.price * (item.quantity ?? 1);
  gtagEvent("remove_from_cart", { currency, value, items: [item] });
}

export function trackViewCart(items: AnalyticsItem[], currency: string) {
  gtagEvent("view_cart", { currency, value: itemsValue(items), items });
}

export function trackBeginCheckout(items: AnalyticsItem[], value: number, currency: string) {
  gtagEvent("begin_checkout", { currency, value, items });
  fbqEvent("InitiateCheckout", {
    content_ids: items.map((item) => item.item_id),
    value,
    currency,
    num_items: items.length,
  });
}

export function trackPurchase(
  transactionId: string,
  items: AnalyticsItem[],
  value: number,
  currency: string
) {
  gtagEvent("purchase", { transaction_id: transactionId, currency, value, items });
  fbqEvent("Purchase", {
    content_ids: items.map((item) => item.item_id),
    value,
    currency,
  });
}

export function trackAddToWishlist(item: AnalyticsItem, currency: string) {
  gtagEvent("add_to_wishlist", { currency, value: item.price, items: [item] });
  fbqEvent("AddToWishlist", {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: item.item_category,
    value: item.price,
    currency,
  });
}

export function trackSearch(searchTerm: string, resultCount: number) {
  gtagEvent("search", { search_term: searchTerm });
  fbqEvent("Search", { search_string: searchTerm, result_count: resultCount });
}

export function trackGenerateLead(source: string) {
  gtagEvent("generate_lead", { lead_source: source });
  fbqEvent("Lead", { content_name: source });
}

export function trackSignUp(method: string) {
  gtagEvent("sign_up", { method });
  fbqEvent("CompleteRegistration", { status: true, method });
}
