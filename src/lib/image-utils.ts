/**
 * Client-side image compression utility.
 * Resizes and compresses images before upload to reduce bandwidth on mobile.
 * This is NOT a security layer — server must still validate all uploads.
 */

const MAX_DIMENSION = 1920;
const COMPRESSION_QUALITY = 0.8;

/**
 * Compress an image file to WebP format with reduced dimensions.
 * @param file - The original image file
 * @param maxDimension - Maximum width or height in pixels
 * @param quality - WebP compression quality (0-1)
 * @returns Compressed image as a Blob
 */
export async function compressImage(
  file: File,
  maxDimension: number = MAX_DIMENSION,
  quality: number = COMPRESSION_QUALITY
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if exceeds max dimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Create an object URL for image preview.
 * Remember to revoke when no longer needed.
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
