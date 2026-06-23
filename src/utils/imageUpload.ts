import { supabase } from '@/lib/supabase';

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
    // Generate a unique filename to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
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
