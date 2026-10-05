// Generates public/sitemap.xml before each build — static marketing pages plus every
// live product and lookbook entry, so search engines don't have to discover them by crawl
// alone. Runs against the anon key, same as the storefront itself (public data only).
import { writeFileSync } from "node:fs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = process.env.SITEMAP_BASE_URL || "https://azach.ca";

const STATIC_PATHS = [
  "/",
  "/shop-all",
  "/women",
  "/men",
  "/sale",
  "/bespoke",
  "/rework",
  "/our-story",
  "/lookbook",
  "/customer-service",
  "/returns",
  "/size-guide",
  "/privacy-policy",
  "/terms-of-service",
];

async function fetchProductPaths() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("generate-sitemap: missing Supabase env vars, skipping product URLs");
    return [];
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,updated_at&in_stock=eq.true`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) {
    console.warn(`generate-sitemap: products fetch failed (${res.status}), skipping product URLs`);
    return [];
  }
  const products = await res.json();
  return products.map((p) => ({ path: `/product/${p.id}`, lastmod: p.updated_at }));
}

function urlEntry(path, lastmod) {
  return `  <url>
    <loc>${SITE_URL}${path}</loc>${lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}
  </url>`;
}

async function main() {
  const productEntries = await fetchProductPaths();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PATHS.map((p) => urlEntry(p)).join("\n")}
${productEntries.map((p) => urlEntry(p.path, p.lastmod)).join("\n")}
</urlset>
`;

  writeFileSync("public/sitemap.xml", xml);
  console.log(`generate-sitemap: wrote ${STATIC_PATHS.length + productEntries.length} URLs to public/sitemap.xml`);
}

main();
