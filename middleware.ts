// Vercel Edge Middleware. Two jobs:
//  1. Keeps azach.ng as the Nigeria-facing domain and steers everyone else to
//     azach.ca (both serve the same deployment).
//  2. Serves real per-product Open Graph/Twitter tags to social media crawlers
//     hitting /product/:id — the app is a client-rendered SPA, so without this
//     Facebook/Twitter/WhatsApp/etc. would only ever see the generic homepage
//     tags baked into index.html, since they don't execute JS.
export const config = {
  matcher: '/((?!assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|mjs|ico|woff2?|mp4|txt|xml)$).*)',
};

// Known social/link-preview crawlers. Matching on user-agent is the standard way
// to detect these — real browsers never send these tokens.
const BOT_UA_PATTERN = /facebookexternalhit|Facebot|Twitterbot|Slackbot|Discordbot|LinkedInBot|WhatsApp|TelegramBot|Pinterest|redditbot|vkShare|SkypeUriPreview|Applebot/i;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchProduct(id: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=name,description,image_url,price`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );

  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

function productMetaHtml(product: { name: string; description?: string; image_url: string; price: number }, canonicalUrl: string): string {
  const title = `${escapeHtml(product.name)} - AZACH`;
  const description = escapeHtml(
    product.description?.trim() || `Shop ${product.name} at AZACH — sustainable, upcycled fashion.`
  );
  const image = product.image_url;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${canonicalUrl}" />

<meta property="og:type" content="product" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="product:price:amount" content="${product.price}" />
<meta property="product:price:currency" content="NGN" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@AZACH" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
</head>
<body>
<h1>${title}</h1>
<p>${description}</p>
<img src="${image}" alt="${escapeHtml(product.name)}" />
</body>
</html>`;
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const hostname = url.hostname;

  if (hostname === 'azach.ng' || hostname === 'www.azach.ng') {
    const country = request.headers.get('x-vercel-ip-country');

    if (country && country !== 'NG') {
      const target = new URL(url.pathname + url.search, 'https://azach.ca');
      return Response.redirect(target.toString(), 307);
    }
  }

  const productMatch = url.pathname.match(/^\/product\/([^/]+)\/?$/);
  const userAgent = request.headers.get('user-agent') || '';

  if (productMatch && BOT_UA_PATTERN.test(userAgent)) {
    const product = await fetchProduct(productMatch[1]);

    if (product) {
      return new Response(productMetaHtml(product, url.toString()), {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
  }
}
