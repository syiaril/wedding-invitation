'use client';

import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { Ticket } from 'lucide-react';

interface GuestTicketProps {
  guestId: string;
  guestName: string;
  category: string;
  kodeTiket: string;
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

export default function GuestTicket({ guestId, guestName, category, kodeTiket }: GuestTicketProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-earth-200/60">
        {/* Top decorative accent */}
        <div className="h-1.5 bg-gradient-to-r from-sage-300 via-gold-400 to-sage-300" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <p className="font-script text-gold-500 text-2xl leading-tight mb-1">
            The Wedding of
          </p>
          <h2 className="font-serif text-sage-800 text-lg tracking-wide">
            Asmunandar & Salasatin
          </h2>
          <p className="text-earth-400 text-[11px] tracking-[0.2em] uppercase mt-1.5">
            18 Oktober 2026
          </p>
        </div>

        {/* Guest Info */}
        <div className="px-6 pb-4 text-center">
          <p className="text-earth-400 text-[10px] tracking-[0.25em] uppercase mb-1.5">
            Kepada Yth.
          </p>
          <h3 className="font-serif text-sage-900 text-xl md:text-2xl font-semibold leading-snug">
            {guestName}
          </h3>
          <div className="mt-2.5 inline-flex items-center gap-1.5">
            <span
              className={`px-3 py-0.5 text-[11px] font-medium tracking-wider uppercase
                rounded-full border ${getCategoryStyle(category)}`}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Dashed Divider — ticket tear-off effect */}
        <div className="relative mx-4">
          <div className="ticket-divider" />
          {/* Notches */}
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-earth-50 rounded-full" />
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-earth-50 rounded-full" />
        </div>

        {/* QR Code Section */}
        <div className="px-6 py-6 flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-4">
            <Ticket size={14} className="text-gold-400" />
            <p className="text-earth-400 text-[10px] tracking-[0.2em] uppercase font-medium">
              Boarding Pass
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-3 bg-white rounded-xl border border-earth-100 shadow-sm"
          >
            <QRCode
              value={kodeTiket}
              size={160}
              level="M"
              bgColor="#FFFFFF"
              fgColor="#3F4E38"
            />
          </motion.div>

          <p className="mt-4 text-earth-400 text-xs text-center leading-relaxed max-w-[260px]">
            Tunjukkan kode ini kepada penerima tamu saat tiba di lokasi.
          </p>
        </div>

        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-transparent via-gold-300/40 to-transparent" />
      </div>
    </motion.div>
  );
}
