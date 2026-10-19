// R2R campaign assets hosted externally — no longer in Supabase storage.

// Campaign film on YouTube — opened via "Watch the Film".
export const FILM_URL = 'https://youtu.be/NvrFPcmXcGQ';

// Campaign catalog (PDF) — opened via "View the Collection". Served from the
// free jsDelivr CDN (backed by media/catalog.pdf in this repo), so there's no
// egress cost on our own hosting. jsDelivr serves it with an inline
// content-type, so it opens in the browser's native PDF viewer in a new tab —
// no forced download, no Google Drive viewer UI.
export const CATALOG_URL =
  'https://cdn.jsdelivr.net/gh/thenextwaveapp/azach@main/media/catalog.pdf';
