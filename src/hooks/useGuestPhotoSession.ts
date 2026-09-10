'use client';

import { useState, useEffect, useCallback } from 'react';
import { SESSION_STORAGE_KEY, GUEST_PHOTO_LIMIT } from '@/lib/constants';

interface PhotoSessionData {
  sessionToken: string;
  sessionId: string;
  guestName: string;
  photoCount: number;
  photoLimit: number;
}

interface GuestPhoto {
  id: string;
  signed_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface UseGuestPhotoSessionReturn {
  /** Whether the session is being loaded/validated */
  isLoading: boolean;
  /** Whether a valid session exists */
  hasSession: boolean;
  /** Session data if valid */
  session: PhotoSessionData | null;
  /** Guest's photos */
  photos: GuestPhoto[];
  /** Whether photos are being loaded */
  isLoadingPhotos: boolean;
  /** Create a new session */
  createSession: (guestName: string) => Promise<{ success: boolean; error?: string }>;
  /** Whether session is being created */
  isCreating: boolean;
  /** Refresh photos from server */
  refreshPhotos: () => Promise<void>;
  /** Update photo count locally (after successful upload) */
  incrementPhotoCount: (amount?: number) => void;
  /** Clear the current session */
  clearSession: () => void;
}

export function useGuestPhotoSession(): UseGuestPhotoSessionReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [session, setSession] = useState<PhotoSessionData | null>(null);
  const [photos, setPhotos] = useState<GuestPhoto[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

  // Validate a stored session token on mount
  useEffect(() => {
    const validateStoredSession = async () => {
      const storedToken = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/guest-photos/session/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_token: storedToken }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.valid) {
            setSession({
              sessionToken: storedToken,
              sessionId: data.session_id,
              guestName: data.guest_name,
              photoCount: data.photo_count,
              photoLimit: data.photo_limit,
            });
          } else {
            // Invalid session, clean up
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
        // Network error, don't clear — user might be offline temporarily
      } finally {
        setIsLoading(false);
      }
    };

    validateStoredSession();
  }, []);

  // Load photos when session becomes available
  const refreshPhotos = useCallback(async () => {
    if (!session) return;

    setIsLoadingPhotos(true);
    try {
      const res = await fetch('/api/guest-photos/mine', {
        headers: { 'x-session-token': session.sessionToken },
      });

      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch {
      // Silent fail on photo load
    } finally {
      setIsLoadingPhotos(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      void (async () => {
        await refreshPhotos();
      })();
    }
  }, [session, refreshPhotos]);

  // Create a new session
  const createSession = useCallback(async (guestName: string) => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/guest-photos/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_name: guestName }),
      });

      const data = await res.json();

      if (res.ok && data.session_token) {
        localStorage.setItem(SESSION_STORAGE_KEY, data.session_token);
        setSession({
          sessionToken: data.session_token,
          sessionId: data.session_id,
          guestName: data.guest_name,
          photoCount: data.photo_count,
          photoLimit: data.photo_limit ?? GUEST_PHOTO_LIMIT,
        });
        return { success: true };
      }

      return {
        success: false,
        error: data.message || 'Gagal membuat sesi foto.',
      };
    } catch {
      return { success: false, error: 'Terjadi kesalahan jaringan. Silakan coba lagi.' };
    } finally {
      setIsCreating(false);
    }
  }, []);

  const incrementPhotoCount = useCallback((amount: number = 1) => {
    setSession((prev) =>
      prev ? { ...prev, photoCount: prev.photoCount + amount } : prev
    );
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setPhotos([]);
  }, []);

  return {
    isLoading,
    hasSession: !!session,
    session,
    photos,
    isLoadingPhotos,
    createSession,
    isCreating,
    refreshPhotos,
    incrementPhotoCount,
    clearSession,
  };
}
