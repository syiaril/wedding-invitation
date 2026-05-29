'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { GALLERY_PHOTOS } from '@/lib/assets';

const galleryImages = GALLERY_PHOTOS;

export default function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
      prev !== null ? (prev + 1) % galleryImages.length : null
    );
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : null
    );
  }, []);

  return (
    <section id="gallery" className="relative py-20 px-6 bg-sage-50 overflow-hidden">
      <div className="max-w-2xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-2">
              Galeri Foto
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-sage-800 mb-4">
              Momen Bahagia
            </h2>
            <div className="ornament-divider">
              <span className="text-gold-400">
                <ImageIcon size={16} />
              </span>
            </div>
          </div>
        </AnimatedSection>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {galleryImages.map((image, index) => (
            <AnimatedSection key={index} delay={0.1 + index * 0.08}>
              <div
                className="break-inside-avoid cursor-pointer group overflow-hidden rounded-xl
                  shadow-md hover:shadow-xl transition-shadow duration-300 relative"
                onClick={() => openLightbox(index)}
                style={{
                  aspectRatio: index % 3 === 0 ? '3/4' : index % 3 === 1 ? '1/1' : '4/3',
                }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                />
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
                className="relative w-[90vw] h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={galleryImages[lightboxIndex].src}
                  alt={galleryImages[lightboxIndex].alt}
                  fill
                  className="object-contain"
                  sizes="90vw"
                  priority
                />
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

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                text-white/60 text-sm">
                {lightboxIndex + 1} / {galleryImages.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
