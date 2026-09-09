'use client';

import { motion } from 'framer-motion';
import { Music, Play } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';
import { useInvitation } from '@/context/InvitationContext';

export default function MusicToggle() {
  const { isPlaying, toggle } = useMusic();
  const { isOpen } = useInvitation();

  if (!isOpen) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring' }}
      onClick={toggle}
      className="fixed bottom-6 right-6 z-[90] w-12 h-12 rounded-full
        bg-sage-600/90 backdrop-blur-md text-white shadow-lg
        flex items-center justify-center cursor-pointer
        hover:bg-sage-700 transition-colors duration-300
        border border-sage-400/30"
      aria-label={isPlaying ? 'Jeda musik' : 'Putar musik'}
    >
      {isPlaying ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="flex items-center justify-center"
        >
          <Music size={20} />
        </motion.div>
      ) : (
        <Play size={20} className="translate-x-0.5" />
      )}
    </motion.button>
  );
}
