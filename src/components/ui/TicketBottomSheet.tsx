'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Ticket, X, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import GuestTicket from '@/components/ui/GuestTicket';

interface GuestData {
  id: string;
  nama_tamu: string;
  kategori: string;
  kode_tiket: string;
}

export default function TicketBottomSheet() {
  const searchParams = useSearchParams();
  const kode = searchParams.get('kode');

  const [guest, setGuest] = useState<GuestData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch guest data when kode param exists
  useEffect(() => {
    if (!kode) return;

    const fetchGuest = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('guest_list')
        .select('id, nama_tamu, kategori, kode_tiket')
        .eq('kode_tiket', kode)
        .single();

      if (!error && data) {
        setGuest(data as GuestData);
      }
      setIsLoading(false);
    };

    fetchGuest();
  }, [kode]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Drag end handler — close if dragged down far enough
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        setIsOpen(false);
      }
    },
    []
  );

  // Don't render anything if no guest data
  if (!guest || isLoading) return null;

  return (
    <>
      {/* ── Floating Action Button ── */}
      <div className="fixed bottom-20 right-6 z-50">
        <motion.button
          id="ticket-fab"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm bg-white/60 border border-white/20 shadow-xl text-sage-900 font-medium hover:scale-105 transition-transform cursor-pointer"
          aria-label="Tampilkan tiket undangan"
        >
          <Ticket size={18} className="text-gold-500" />
          <span>Tiket Saya</span>
        </motion.button>
      </div>

      {/* ── Bottom Sheet ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="ticket-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="ticket-backdrop"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="ticket-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={handleDragEnd}
              className="ticket-panel"
            >
              {/* Drag Handle */}
              <div className="ticket-panel__handle-area">
                <div className="ticket-panel__handle" />
              </div>

              {/* Header */}
              <div className="ticket-panel__header">
                <div className="ticket-panel__title-group">
                  <Ticket size={16} className="text-gold-500" />
                  <h3 className="ticket-panel__title">E-Ticket Undangan</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ticket-panel__close"
                  aria-label="Tutup tiket"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Swipe hint */}
              <div className="ticket-panel__swipe-hint">
                <ChevronDown size={14} />
                <span>Geser ke bawah untuk menutup</span>
              </div>

              {/* Content — render existing GuestTicket */}
              <div className="ticket-panel__content">
                <GuestTicket
                  guestId={guest.id}
                  guestName={guest.nama_tamu}
                  category={guest.kategori}
                  kodeTiket={guest.kode_tiket}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
