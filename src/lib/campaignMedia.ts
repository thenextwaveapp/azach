import { supabase } from '@/lib/supabase';

// R2R campaign assets hosted in the public campaign-media storage bucket —
// the film is too heavy to ship in the repo/public folder.
const campaignUrl = (path: string) =>
  supabase.storage.from('campaign-media').getPublicUrl(path).data.publicUrl;

export const FILM_URL = campaignUrl('r2r/reconstruction-into-refinement.mp4');
export const CATALOG_URL = campaignUrl('r2r/AZACH-R2R-Catalog.pdf');
