'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export default function Toast({ message, isVisible }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]
            bg-sage-700 text-white px-5 py-3 rounded-full shadow-xl
            flex items-center gap-2 text-sm font-medium"
        >
          <Check size={16} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
