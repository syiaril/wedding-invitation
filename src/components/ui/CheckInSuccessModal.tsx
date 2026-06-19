'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CheckInSuccessModalProps {
  isVisible: boolean;
  guestName: string;
  category: string;
}

const categoryStyles: Record<string, string> = {
  vip: 'bg-gold-300/20 text-gold-600 border-gold-300/40',
  keluarga: 'bg-dusty-100 text-dusty-500 border-dusty-200',
  teman: 'bg-sage-100 text-sage-600 border-sage-200',
};

function getCategoryStyle(category: string): string {
  const key = category.toLowerCase();
  return categoryStyles[key] || 'bg-sage-100 text-sage-600 border-sage-200';
}

export default function CheckInSuccessModal({
  isVisible,
  guestName,
  category,
}: CheckInSuccessModalProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-6"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-sage-900/30 backdrop-blur-sm" />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Top green accent */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-300" />

            <div className="px-6 py-8 flex flex-col items-center text-center">
              {/* Animated Checkmark Circle */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200
                  flex items-center justify-center mb-5"
              >
                <motion.svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <motion.path
                    d="M 6 14 L 12 20 L 22 8"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.45 }}
                  />
                </motion.svg>
              </motion.div>

              {/* Success Text */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <p className="text-emerald-600 text-sm font-medium tracking-wide mb-3">
                  Berhasil Check-in!
                </p>
                <h3 className="font-serif text-sage-900 text-xl font-semibold mb-2">
                  {guestName}
                </h3>
                <span
                  className={`inline-block px-3 py-0.5 text-[11px] font-medium tracking-wider
                    uppercase rounded-full border ${getCategoryStyle(category)}`}
                >
                  {category}
                </span>
              </motion.div>
            </div>

            {/* Bottom subtle accent */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
