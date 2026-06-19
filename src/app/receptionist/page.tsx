'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserCheck,
  Shield,
  LogIn,
  Users,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import QrScanner from '@/components/ui/QrScanner';
import CheckInSuccessModal from '@/components/ui/CheckInSuccessModal';

// ─── Types ───────────────────────────────────────────────────────
interface Guest {
  id: string;
  nama_tamu: string;
  kategori: string;
  status_kehadiran: boolean;
  waktu_check_in: string | null;
}

interface CheckInResult {
  guestName: string;
  category: string;
}

// ─── Web Audio Chime ─────────────────────────────────────────────
function playCheckInChime() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First tone (higher)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Second tone (perfect fifth above, slightly delayed)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.12);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.12, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.8);

    // Cleanup
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Web Audio not available, silently skip
  }
}

// ─── PIN Gate Component ──────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const correctPin = process.env.NEXT_PUBLIC_RECEPTIONIST_PIN || '1818';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === correctPin) {
      onUnlock();
    } else {
      setError(true);
      setShaking(true);
      setPin('');
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-sage-100 flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-sage-600" />
          </div>
          <h1 className="font-serif text-sage-800 text-xl mb-1">Receptionist Access</h1>
          <p className="text-sage-400 text-sm">Masukkan PIN untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div
            animate={shaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              maxLength={10}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="• • • •"
              className={`w-full px-6 py-4 rounded-xl bg-white border text-center
                text-lg tracking-[0.5em] font-medium text-sage-800
                placeholder:text-sage-300 placeholder:tracking-[0.3em]
                focus:outline-none focus:ring-2 transition-all duration-200
                ${error
                  ? 'border-red-300 focus:ring-red-200/50'
                  : 'border-sage-200 focus:ring-sage-300/50 focus:border-sage-400'
                }`}
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs text-center mt-2"
              >
                PIN salah. Silakan coba lagi.
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5
              rounded-xl bg-sage-600 text-white text-sm font-medium tracking-wider
              hover:bg-sage-700 active:scale-[0.98] transition-all duration-200"
          >
            <LogIn size={16} />
            Masuk
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Main Receptionist Dashboard ─────────────────────────────────
export default function ReceptionistPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [scannerPaused, setScannerPaused] = useState(false);

  // Check-in success modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<CheckInResult>({
    guestName: '',
    category: '',
  });

  // Toast messages
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');

  // Manual search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Guest[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Recent check-ins
  const [recentCheckins, setRecentCheckins] = useState<Guest[]>([]);

  // Stats
  const [totalGuests, setTotalGuests] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);

  // ─── Load initial data ─────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const { count: total } = await supabase
      .from('guest_list')
      .select('*', { count: 'exact', head: true });

    const { count: checkedIn } = await supabase
      .from('guest_list')
      .select('*', { count: 'exact', head: true })
      .eq('status_kehadiran', true);

    setTotalGuests(total || 0);
    setCheckedInCount(checkedIn || 0);
  }, []);

  const fetchRecentCheckins = useCallback(async () => {
    const { data } = await supabase
      .from('guest_list')
      .select('*')
      .eq('status_kehadiran', true)
      .order('waktu_check_in', { ascending: false })
      .limit(5);

    if (data) setRecentCheckins(data);
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      fetchStats();
      fetchRecentCheckins();
    }
  }, [isUnlocked, fetchStats, fetchRecentCheckins]);

  // ─── Show Toast ────────────────────────────────────────────
  const showToastMsg = useCallback(
    (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
      setToastMessage(msg);
      setToastType(type);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    []
  );

  // ─── Check-in Logic ────────────────────────────────────────
  const performCheckIn = useCallback(
    async (guestId: string) => {
      // Fetch guest
      const { data: guest, error } = await supabase
        .from('guest_list')
        .select('id, nama_tamu, kategori, status_kehadiran')
        .eq('id', guestId)
        .single();

      if (error || !guest) {
        showToastMsg('❌ Tamu tidak ditemukan.', 'error');
        return false;
      }

      if (guest.status_kehadiran) {
        showToastMsg(`⚠️ ${guest.nama_tamu} sudah check-in sebelumnya.`, 'warning');
        return false;
      }

      // Update status
      const { error: updateError } = await supabase
        .from('guest_list')
        .update({
          status_kehadiran: true,
          waktu_check_in: new Date().toISOString(),
        })
        .eq('id', guestId);

      if (updateError) {
        showToastMsg('❌ Gagal check-in. Silakan coba lagi.', 'error');
        return false;
      }

      // Success!
      setSuccessData({
        guestName: guest.nama_tamu,
        category: guest.kategori,
      });
      setShowSuccess(true);
      playCheckInChime();

      // Refresh data
      fetchStats();
      fetchRecentCheckins();

      return true;
    },
    [showToastMsg, fetchStats, fetchRecentCheckins]
  );

  // ─── QR Scan Handler ──────────────────────────────────────
  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (scannerPaused) return;

      // Pause scanner
      setScannerPaused(true);

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(decodedText.trim())) {
        showToastMsg('❌ QR Code tidak valid.', 'error');
        setTimeout(() => setScannerPaused(false), 1500);
        return;
      }

      await performCheckIn(decodedText.trim());

      // Resume scanner after 2.5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setScannerPaused(false);
      }, 2500);
    },
    [scannerPaused, performCheckIn, showToastMsg]
  );

  // ─── Manual Search ─────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const { data } = await supabase
      .from('guest_list')
      .select('*')
      .ilike('nama_tamu', `%${searchQuery.trim()}%`)
      .limit(5);

    setSearchResults(data || []);
    setIsSearching(false);
  }, [searchQuery]);

  const handleManualCheckIn = useCallback(
    async (guestId: string) => {
      const success = await performCheckIn(guestId);
      if (success) {
        setSearchQuery('');
        setSearchResults([]);
        setTimeout(() => setShowSuccess(false), 2500);
      }
    },
    [performCheckIn]
  );

  // ─── Time formatter ────────────────────────────────────────
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ─── PIN Gate ──────────────────────────────────────────────
  if (!isUnlocked) {
    return <PinGate onUnlock={() => setIsUnlocked(true)} />;
  }

  // ─── Dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-earth-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-earth-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-sage-800 text-lg font-semibold">
              Receptionist
            </h1>
            <p className="text-sage-400 text-[11px] tracking-wide">
              Nandar & Salsa — 18 Okt 2026
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sage-50 border border-sage-100">
            <Users size={14} className="text-sage-500" />
            <span className="text-sage-700 text-sm font-semibold">{checkedInCount}</span>
            <span className="text-sage-400 text-sm">/</span>
            <span className="text-sage-400 text-sm">{totalGuests}</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Scanner Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-4">
            <p className="text-sage-500 text-xs tracking-wide uppercase font-medium">
              Scan QR Code Tamu
            </p>
          </div>
          <QrScanner onScanSuccess={handleScanSuccess} isPaused={scannerPaused} />
        </motion.section>

        {/* Manual Search */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search size={15} className="text-sage-500" />
              <h2 className="text-sage-700 text-sm font-semibold">Cari Manual</h2>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik nama tamu..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) setSearchResults([]);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-sage-50/80 border border-sage-200
                  text-sage-800 text-sm placeholder:text-sage-400
                  focus:outline-none focus:ring-2 focus:ring-sage-300/50 focus:border-sage-400
                  transition-all duration-200"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-sage-600 text-white text-sm font-medium
                  hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-[0.97] transition-all duration-200"
              >
                {isSearching ? '...' : 'Cari'}
              </button>
            </div>

            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2 overflow-hidden"
                >
                  {searchResults.map((guest) => (
                    <motion.div
                      key={guest.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-xl
                        bg-sage-50/60 border border-sage-100"
                    >
                      <div>
                        <p className="text-sage-800 text-sm font-medium">
                          {guest.nama_tamu}
                        </p>
                        <p className="text-sage-400 text-[11px]">{guest.kategori}</p>
                      </div>
                      {guest.status_kehadiran ? (
                        <span className="text-emerald-500 text-xs font-medium flex items-center gap-1">
                          <UserCheck size={13} />
                          Hadir
                        </span>
                      ) : (
                        <button
                          onClick={() => handleManualCheckIn(guest.id)}
                          className="px-3 py-1.5 rounded-lg bg-sage-600 text-white text-xs
                            font-medium hover:bg-sage-700 active:scale-[0.97] transition-all duration-200"
                        >
                          Check-in
                        </button>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Recent Check-ins */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-sage-500" />
                <h2 className="text-sage-700 text-sm font-semibold">Check-in Terbaru</h2>
              </div>
              <span className="text-sage-400 text-[11px]">{recentCheckins.length} tamu</span>
            </div>

            {recentCheckins.length === 0 ? (
              <p className="text-sage-400 text-sm text-center py-6">
                Belum ada tamu yang check-in.
              </p>
            ) : (
              <div className="space-y-2">
                {recentCheckins.map((guest, index) => (
                  <motion.div
                    key={guest.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl
                      bg-sage-50/60 border border-sage-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100
                        flex items-center justify-center flex-shrink-0">
                        <UserCheck size={14} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sage-800 text-sm font-medium">
                          {guest.nama_tamu}
                        </p>
                        <p className="text-sage-400 text-[11px]">{guest.kategori}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sage-400">
                      <span className="text-[11px]">
                        {formatTime(guest.waktu_check_in)}
                      </span>
                      <ChevronRight size={12} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Success Modal */}
      <CheckInSuccessModal
        isVisible={showSuccess}
        guestName={successData.guestName}
        category={successData.category}
      />

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[150]
              px-5 py-3 rounded-full shadow-xl text-sm font-medium
              flex items-center gap-2 max-w-[90%]
              ${toastType === 'error'
                ? 'bg-red-600 text-white'
                : toastType === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-sage-700 text-white'
              }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
