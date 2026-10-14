import { supabase } from '@/lib/supabase';

// R2R campaign assets hosted in the public campaign-media storage bucket —
// the film is too heavy to ship in the repo/public folder.
const campaignUrl = (path: string) =>
  supabase.storage.from('campaign-media').getPublicUrl(path).data.publicUrl;

export const FILM_URL = campaignUrl('r2r/reconstruction-into-refinement.mp4');

// Served from our own domain via a vercel.json rewrite (and a vite dev proxy)
// so visitors never see the raw storage URL in their address bar.
export const CATALOG_URL = '/catalog';
