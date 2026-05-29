'use client';

import { Play } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function VideoSection() {
  return (
    <section id="video" className="relative py-20 px-6 bg-earth-50">
      <div className="max-w-lg mx-auto">
        <AnimatedSection>
          <div className="text-center mb-10">
            <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-2">
              Our Moments
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-sage-800 mb-4">
              Video Prewedding
            </h2>
            <div className="ornament-divider">
              <span className="text-gold-400">
                <Play size={16} fill="currentColor" />
              </span>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <div className="glass-card overflow-hidden">
            <div className="relative w-full aspect-video">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Video Prewedding Nobita & Sizuka"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <p className="text-center text-sage-500 text-sm mt-6 italic">
            &ldquo;Every love story is beautiful, but ours is my favorite.&rdquo;
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
