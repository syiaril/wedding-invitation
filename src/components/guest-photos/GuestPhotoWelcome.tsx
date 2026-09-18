'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles } from 'lucide-react';
import { MAX_GUEST_NAME_LENGTH } from '@/lib/constants';

interface GuestPhotoWelcomeProps {
  onSubmit: (name: string) => Promise<{ success: boolean; error?: string }>;
  isSubmitting: boolean;
}

export default function GuestPhotoWelcome({
  onSubmit,
  isSubmitting,
}: GuestPhotoWelcomeProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Silakan masukkan nama terlebih dahulu.');
      return;
    }

    if (trimmed.length > MAX_GUEST_NAME_LENGTH) {
      setError(`Nama maksimal ${MAX_GUEST_NAME_LENGTH} karakter.`);
      return;
    }

    setError('');
    const result = await onSubmit(trimmed);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 rounded-2xl bg-crimson-100 flex items-center justify-center mx-auto mb-6"
      >
        <Camera size={28} className="text-crimson-600" />
      </motion.div>

      <p className="text-crimson-600 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
        Abadikan momen terbaik dari hari bahagia kami dan bagikan kenanganmu
        bersama kami.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto">
        <div>
          <label
            htmlFor="guest-photo-name"
            className="block text-crimson-700 text-xs font-medium tracking-wide mb-2"
          >
            Siapa yang mengabadikan momen ini?
          </label>
          <input
            id="guest-photo-name"
            type="text"
            placeholder="Nama Kamu"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            maxLength={MAX_GUEST_NAME_LENGTH}
            autoComplete="name"
            className="w-full px-4 py-3 rounded-xl bg-crimson-50 border border-crimson-200
              text-crimson-800 text-sm placeholder:text-crimson-400
              focus:outline-none focus:ring-2 focus:ring-crimson-400/50 focus:border-crimson-400
              transition-all duration-200"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs text-center"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
            bg-crimson-600 text-white text-sm font-medium tracking-wider
            hover:bg-crimson-700 active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300"
        >
          <Sparkles size={16} />
          {isSubmitting ? 'Mempersiapkan sesi...' : 'Mulai Mengabadikan'}
        </button>
      </form>
    </div>
  );
}
