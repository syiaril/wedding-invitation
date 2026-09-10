/** Maximum photos each guest session can upload */
export const GUEST_PHOTO_LIMIT = 10;

/** Maximum file size in bytes (10MB) */
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

/** Allowed image MIME types for guest photo uploads */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/** Supabase Storage bucket name for guest photos */
export const GUEST_PHOTO_BUCKET = 'guest-photos';

/** Maximum guest name length */
export const MAX_GUEST_NAME_LENGTH = 50;

/** Signed URL expiry duration in seconds (1 hour) */
export const SIGNED_URL_EXPIRY = 3600;

/** Photo moderation statuses */
export type PhotoStatus = 'pending' | 'approved' | 'rejected';

/** LocalStorage key for photo session token */
export const SESSION_STORAGE_KEY = 'wedding_photo_session';
