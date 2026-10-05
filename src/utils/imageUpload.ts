import { supabase } from '@/lib/supabase';

/**
 * Re-encodes an image file as WebP client-side before upload — keeps Supabase Storage
 * egress down since source uploads (phone camera JPEGs, screenshot PNGs) are often
 * several MB while an equivalent WebP is a fraction of the size.
 */
async function convertToWebP(file: File, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported in this browser');
  ctx.drawImage(bitmap, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('WebP conversion failed'))),
      'image/webp',
      quality
    );
  });
}

/**
 * Uploads an image file to Supabase Storage
 * @param file - The image file to upload
 * @param folder - Optional folder path within the bucket (e.g., 'products')
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToStorage(
  file: File,
  folder: string = 'products'
): Promise<string> {
  try {
    const webpBlob = await convertToWebP(file);
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, webpBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/webp',
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Uploads multiple image files to Supabase Storage
 * @param files - Array of image files to upload
 * @param folder - Optional folder path within the bucket
 * @returns Array of public URLs for the uploaded images
 */
export async function uploadMultipleImages(
  files: File[],
  folder: string = 'products'
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImageToStorage(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Uploads reference images from a public form (Bespoke, Rework) to Supabase Storage.
 * Unlike product images, these are uploaded by anonymous site visitors.
 * @param files - Array of image files to upload
 * @param folder - Folder path within the bucket (e.g. 'bespoke', 'rework')
 * @returns Array of public URLs for the uploaded images
 */
export async function uploadFormAttachments(
  files: File[],
  folder: string
): Promise<string[]> {
  const uploadPromises = files.map(async (file) => {
    const webpBlob = await convertToWebP(file);
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;

    const { data, error } = await supabase.storage
      .from('form-attachments')
      .upload(fileName, webpBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/webp',
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('form-attachments')
      .getPublicUrl(data.path);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
}

/**
 * Deletes an image from Supabase Storage using its URL
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const urlParts = imageUrl.split('/storage/v1/object/public/product-images/');
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL format');
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}
