'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInvitation } from '@/context/InvitationContext';
import { useCountdown } from '@/hooks/useCountdown';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { HERO_BG } from '@/lib/assets';

const WEDDING_DATE = new Date('2026-10-18T07:00:00+07:00');

export default function HeroSection() {
  const { guestName } = useInvitation();
  const countdown = useCountdown(WEDDING_DATE);

  const countdownItems = [
    { value: countdown.days, label: 'Hari' },
    { value: countdown.hours, label: 'Jam' },
    { value: countdown.minutes, label: 'Menit' },
    { value: countdown.seconds, label: 'Detik' },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center
        text-white overflow-hidden"
    >
      {/* Background Image */}
      <Image
        src={HERO_BG}
        alt="Wedding Hero"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sage-900/50 via-sage-800/40 to-sage-900/70" />

      {/* Top decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-gold-400/50 to-transparent z-10" />

      <div className="relative z-10 text-center px-6 py-20 max-w-lg mx-auto">
        <AnimatedSection delay={0.2}>
          <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-2">
            Kepada Yth.
          </p>
          <p className="text-white/90 text-xl font-serif mb-8">
            {guestName}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <p className="text-white/70 text-sm tracking-[0.4em] uppercase mb-4">
            The Wedding Of
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.6}>
          <h2
            className="text-6xl md:text-8xl text-white mb-2"
            style={{ fontFamily: 'Great Vibes, cursive' }}
          >
            Nandar
          </h2>
          <div className="ornament-divider">
            <span className="text-gold-400 text-2xl">&amp;</span>
          </div>
          <h2
            className="text-6xl md:text-8xl text-white mb-6"
            style={{ fontFamily: 'Great Vibes, cursive' }}
          >
            Salsa
          </h2>
        </AnimatedSection>

        <AnimatedSection delay={0.8}>
          <p className="text-white/80 font-serif text-lg tracking-wider mb-12">
            18 Oktober 2026
          </p>
        </AnimatedSection>

        {/* Countdown */}
        <AnimatedSection delay={1.0}>
          <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
            {countdownItems.map((item) => (
              <div key={item.label} className="text-center">
                <motion.div
                  key={item.value}
                  initial={{ scale: 1.15, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 mx-auto rounded-xl bg-white/10 backdrop-blur-md
                    border border-white/20 flex items-center justify-center
                    text-2xl font-serif font-bold text-white mb-1"
                >
                  {String(item.value).padStart(2, '0')}
                </motion.div>
                <span className="text-white/50 text-[10px] tracking-widest uppercase">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-t from-transparent via-gold-400/30 to-transparent z-10" />
    </section>
  );
}
