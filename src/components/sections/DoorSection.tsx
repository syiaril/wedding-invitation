'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useInvitation } from '@/context/InvitationContext';
import { useMusic } from '@/context/MusicContext';
import { ChevronUp } from 'lucide-react';
import { COVER_BG } from '@/lib/assets';

export default function DoorSection() {
  const { isOpen, guestName, openInvitation } = useInvitation();
  const { play } = useMusic();

  const handleOpen = () => {
    openInvitation();
    play();
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          key="door"
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Image */}
          <Image
            src={COVER_BG}
            alt="Wedding Cover"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-sage-900/55 via-sage-900/40 to-sage-900/70" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Decorative top ornament */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-gold-400 text-3xl mb-4"
            >
              ✦
            </motion.div>

            {/* The Wedding Of */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-white/80 font-serif text-lg tracking-[0.3em] uppercase mb-2"
            >
              The Wedding Of
            </motion.p>

            {/* Couple Names */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-white text-5xl md:text-7xl mb-2"
              style={{ fontFamily: 'Great Vibes, cursive' }}
            >
              Asmunandar
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-gold-400 text-2xl font-serif mb-1"
            >
              &amp;
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="text-white text-5xl md:text-7xl mb-8"
              style={{ fontFamily: 'Great Vibes, cursive' }}
            >
              Salasatin
            </motion.h1>

            {/* Guest Name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="text-center mb-10"
            >
              <p className="text-white/60 text-sm tracking-wider uppercase mb-1">
                Kepada Yth.
              </p>
              <p className="text-white text-xl font-serif font-medium">
                {guestName}
              </p>
            </motion.div>

            {/* Open Button */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              type="button"
              className="group relative px-8 py-3 rounded-full
                bg-white/15 backdrop-blur-md border border-white/30
                text-white text-sm font-medium tracking-wider uppercase
                hover:bg-white/25 transition-all duration-300 cursor-pointer
                flex items-center gap-2"
            >
              <span>Buka Undangan</span>
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronUp size={16} />
              </motion.span>
            </motion.button>
          </div>

          {/* Bottom ornament */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="absolute bottom-8 z-10 text-gold-400/40 text-xs tracking-[0.5em] uppercase"
          >
             18 . 10 . 2026
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
