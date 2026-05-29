'use client';

import Image from 'next/image';
import { ChevronUp, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { COVER_BG } from '@/lib/assets';

export default function ClosingSection() {
  const scrollToTop = () => {
    import('framer-motion').then(({ animate }) => {
      animate(window.scrollY, 0, {
        duration: 1.2,
        ease: [0.32, 0.72, 0, 1],
        onUpdate: (value) => window.scrollTo(0, value),
      });
    });
  };

  return (
    <section
      id="closing"
      className="relative py-20 px-6 text-white overflow-hidden"
    >
      {/* Background Image */}
      <Image
        src={COVER_BG}
        alt="Closing background"
        fill
        className="object-cover"
        sizes="100vw"
        loading="lazy"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sage-900/80 to-sage-900/90" />

      <div className="relative z-10 max-w-lg mx-auto text-center">
        <AnimatedSection>
          <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-4">
            Wassalamualaikum Warahmatullahi Wabarakatuh
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="text-white/80 font-serif text-lg mb-6">
            Kami yang berbahagia
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <h2
            className="text-5xl md:text-6xl text-white mb-2"
            style={{ fontFamily: 'Great Vibes, cursive' }}
          >
            Nandar
          </h2>
          <div className="flex justify-center my-2">
            <Heart size={20} className="text-dusty-300" fill="currentColor" />
          </div>
          <h2
            className="text-5xl md:text-6xl text-white mb-8"
            style={{ fontFamily: 'Great Vibes, cursive' }}
          >
            Salsa
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed mb-10">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
            Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.5}>
          <p className="text-white/40 text-xs tracking-wider mb-6">
            Terima kasih atas segala ucapan, doa, dan perhatian yang diberikan.
          </p>
        </AnimatedSection>

        {/* Back to top */}
        <AnimatedSection delay={0.6}>
          <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full
              bg-white/10 backdrop-blur-md border border-white/20
              text-white/70 text-xs tracking-wider uppercase
              hover:bg-white/20 transition-all duration-300 cursor-pointer"
          >
            <ChevronUp size={14} />
            Kembali ke Atas
          </motion.button>
        </AnimatedSection>

        {/* Copyright */}
        <div className="mt-16 pt-6 border-t border-white/10">
          <p className="text-white/30 text-[10px] tracking-wider">
            © 2026 Nandar & Salsa. Made with ❤️
          </p>
        </div>
      </div>
    </section>
  );
}
