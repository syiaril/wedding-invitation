'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { supabase } from '@/lib/supabase';

interface PublicGuestPhoto {
  id: string;
  guest_name: string;
  signed_url: string;
  created_at: string;
}

export default function PublicGuestGallery() {
  const [photos, setPhotos] = useState<PublicGuestPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/guest-photos/public');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchPhotos();
    })();
  }, [fetchPhotos]);

  useEffect(() => {
    const channel = supabase
      .channel('public-guest-photos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guest_photos' },
        () => {
          void (async () => {
            await fetchPhotos();
          })();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPhotos]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % photos.length : null
    );
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + photos.length) % photos.length : null
    );
  }, [photos.length]);

  if (isLoading || photos.length === 0) {
    return null; // Hide the section if there are no guest photos yet
  }

  return (
    <div className="mt-20">
      <AnimatedSection>
        <div className="text-center mb-12">
          <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-2">
            Kenangan dari Tamu
          </p>
          <div className="ornament-divider">
            <span className="text-gold-400">
              <Camera size={16} />
            </span>
          </div>
        </div>
      </AnimatedSection>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {photos.map((photo, index) => (
          <AnimatedSection key={photo.id} delay={0.1 + (index % 5) * 0.08}>
            <div
              className="break-inside-avoid cursor-pointer group overflow-hidden rounded-xl
                shadow-md hover:shadow-xl transition-shadow duration-300 relative"
              onClick={() => openLightbox(index)}
              style={{
                aspectRatio: index % 3 === 0 ? '3/4' : index % 3 === 1 ? '1/1' : '4/3',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.signed_url}
                alt={`Diabadikan oleh ${photo.guest_name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs font-medium truncate">
                  Diabadikan oleh {photo.guest_name}
                </p>
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full
                bg-white/10 backdrop-blur-md flex items-center justify-center
                text-white hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Prev button */}
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 z-10 w-10 h-10 rounded-full
                bg-white/10 backdrop-blur-md flex items-center justify-center
                text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative w-[90vw] h-[85vh] flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[lightboxIndex].signed_url}
                alt={`Diabadikan oleh ${photos[lightboxIndex].guest_name}`}
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute bottom-4 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <p className="text-white text-sm">
                  Diabadikan oleh <span className="font-semibold">{photos[lightboxIndex].guest_name}</span>
                </p>
              </div>
            </motion.div>

            {/* Next button */}
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 z-10 w-10 h-10 rounded-full
                bg-white/10 backdrop-blur-md flex items-center justify-center
                text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
