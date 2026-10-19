// R2R campaign assets hosted externally — no longer in Supabase storage.

// Campaign film on YouTube — opened via "Watch the Film".
export const FILM_URL = 'https://youtu.be/NvrFPcmXcGQ';

// Campaign catalog (PDF) self-hosted as a static asset — opened via "View the
// Collection". Served from our own domain with an inline content-type, so it
// opens in the browser's native PDF viewer in a new tab (no Google Drive UI,
// no forced download).
export const CATALOG_URL = '/catalog.pdf';
