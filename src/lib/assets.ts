/**
 * Supabase Storage asset URLs
 * 
 * All wedding assets are stored in Supabase Storage bucket: "wedding-assets"
 * 
 * To replace images:
 * 1. Go to Supabase Dashboard → Storage → wedding-assets
 * 2. Upload your image to the correct path (e.g., images/hero.jpg)
 * 3. The website will automatically use the new image
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const BUCKET = 'wedding-assets';

function getStorageUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}?v=1`;
}

// Background music
export const MUSIC_URL = getStorageUrl('music/background.mp3');

// Hero section background
export const HERO_BG = getStorageUrl('images/hero.jpg');

// Door/Cover & Closing section background  
export const COVER_BG = getStorageUrl('images/cover.jpg');

// Couple photo (Opening section)
export const COUPLE_PHOTO = getStorageUrl('images/couple.jpg');

// Gallery photos
export const GALLERY_PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  src: getStorageUrl(`images/gallery/${i + 1}.jpg`),
  alt: `Wedding moment ${i + 1}`,
}));
