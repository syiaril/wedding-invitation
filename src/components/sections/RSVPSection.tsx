'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Toast from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { useGuestPhotoSession } from '@/hooks/useGuestPhotoSession';
import { SESSION_STORAGE_KEY } from '@/lib/constants';

interface Wish {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

interface Reaction {
  id: string;
  emoji: string;
  count: number;
}

const PAGE_SIZE = 5;

const reactionOptions = [
  { emoji: '👍', label: 'Upvote' },
  { emoji: '😆', label: 'Funny' },
  { emoji: '😍', label: 'Love' },
  { emoji: '😮', label: 'Surprised' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😢', label: 'Sad' },
];

// Format waktu relatif
function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  if (diffDay < 2) return 'kemarin';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Skeleton loading component
function WishSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-crimson-50/60 border border-crimson-100 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-24 bg-crimson-200/50 rounded" />
        <div className="h-3 w-20 bg-crimson-200/30 rounded" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-crimson-200/40 rounded" />
        <div className="h-3 w-3/4 bg-crimson-200/30 rounded" />
      </div>
    </div>
  );
}

export default function RSVPSection() {
  // RSVP form
  const [rsvpName, setRsvpName] = useState('');
  const [attendance, setAttendance] = useState('hadir');
  const [guests, setGuests] = useState(1);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);

  // Wishes
  const [wishName, setWishName] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [wishSubmitting, setWishSubmitting] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>([]);

  // Pagination
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Session
  const { session, hasSession, createSession } = useGuestPhotoSession();

  // Sync wishName with session name if available
  useEffect(() => {
    if (session?.guestName) {
      setTimeout(() => setWishName(session.guestName), 0);
    }
  }, [session?.guestName]);

  // Reactions
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [clickedEmoji, setClickedEmoji] = useState<string | null>(null);
  const [hasReacted, setHasReacted] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showToastMsg = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  // Cursor-based fetch wishes
  const fetchWishes = useCallback(async (cursor?: string) => {
    let query = supabase
      .from('wishes')
      .select('id, name, message, created_at')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data } = await query;

    if (data) {
      setWishes((prev) => {
        if (!cursor) return data;
        // Deduplication
        const existingIds = new Set(prev.map((w) => w.id));
        const unique = data.filter((w) => !existingIds.has(w.id));
        return [...prev, ...unique];
      });
      setHasMore(data.length === PAGE_SIZE);
    }
  }, []);

  // Load more handler
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || wishes.length === 0) return;
    setLoadingMore(true);

    const lastWish = wishes[wishes.length - 1];
    await fetchWishes(lastWish.created_at);

    setLoadingMore(false);
  }, [loadingMore, hasMore, wishes, fetchWishes]);

  // Initial data load + realtime
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      const [wishesRes, reactionsRes, countRes] = await Promise.all([
        supabase
          .from('wishes')
          .select('id, name, message, created_at')
          .order('created_at', { ascending: false })
          .limit(PAGE_SIZE),
        supabase
          .from('reactions')
          .select('*')
          .order('emoji'),
        supabase
          .from('wishes')
          .select('*', { count: 'exact', head: true }),
      ]);

      if (isMounted) {
        if (wishesRes.data) {
          setWishes(wishesRes.data);
          setHasMore(wishesRes.data.length === PAGE_SIZE);
        }
        if (reactionsRes.data) setReactions(reactionsRes.data);
        if (countRes.count !== null) setTotalCount(countRes.count);

        // Check if user has already reacted
        const savedReaction = localStorage.getItem('wedding_reaction');
        if (savedReaction) {
          setHasReacted(true);
          setUserReaction(savedReaction);
        }

        setInitialLoading(false);
      }
    };

    loadInitialData();

    // Realtime channel for live wishes & reactions
    const channel = supabase
      .channel('realtime-wishes-reactions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wishes' },
        (payload) => {
          const newWish = payload.new as Wish;
          setWishes((prev) => {
            if (prev.some((w) => w.id === newWish.id)) return prev;
            return [newWish, ...prev];
          });
          setTotalCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updated = payload.new as Reaction;
            setReactions((prev) => {
              const exists = prev.some((r) => r.emoji === updated.emoji);
              if (exists) {
                return prev.map((r) => (r.emoji === updated.emoji ? updated : r));
              }
              return [...prev, updated];
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle RSVP submit
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    setRsvpSubmitting(true);
    const { error } = await supabase.from('rsvps').insert({
      name: rsvpName.trim(),
      attendance,
      guests,
    });
    setRsvpSubmitting(false);

    if (!error) {
      showToastMsg('RSVP berhasil dikirim! Terima kasih 🎉');
      setRsvpName('');
      setAttendance('hadir');
      setGuests(1);
    }
  };

  // Handle wish submit
  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName.trim() || !wishMessage.trim()) return;

    setWishSubmitting(true);
    
    let token = localStorage.getItem(SESSION_STORAGE_KEY);
    
    // Create session if it doesn't exist
    if (!hasSession || !token) {
      const res = await createSession(wishName.trim());
      if (!res.success) {
        showToastMsg(res.error || 'Gagal membuat sesi');
        setWishSubmitting(false);
        return;
      }
      token = localStorage.getItem(SESSION_STORAGE_KEY);
    }

    const res = await fetch('/api/wishes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-token': token || ''
      },
      body: JSON.stringify({ message: wishMessage.trim() })
    });

    setWishSubmitting(false);

    if (res.ok) {
      showToastMsg('Ucapan berhasil dikirim! 💌');
      setWishMessage('');
    } else {
      const data = await res.json();
      showToastMsg(data.error || 'Gagal mengirim ucapan');
    }
  };

  // Handle reaction
  const handleReaction = async (emoji: string) => {
    const token = localStorage.getItem(SESSION_STORAGE_KEY) || '';

    const oldEmoji = userReaction;
    const newEmoji = emoji;
    const isToggleOff = oldEmoji === newEmoji;

    setClickedEmoji(emoji);
    setTimeout(() => setClickedEmoji(null), 600);

    // Optimistic local update
    setReactions((prev) => {
      const nextState = [...prev];
      if (!nextState.find(r => r.emoji === newEmoji)) {
        nextState.push({ id: Math.random().toString(), emoji: newEmoji, count: 0 });
      }
      return nextState.map((r) => {
        if (isToggleOff) {
          if (r.emoji === newEmoji) return { ...r, count: Math.max(0, (r.count || 0) - 1) };
        } else {
          if (r.emoji === newEmoji) return { ...r, count: (r.count || 0) + 1 };
          if (r.emoji === oldEmoji) return { ...r, count: Math.max(0, (r.count || 0) - 1) };
        }
        return r;
      });
    });

    if (isToggleOff) {
      setHasReacted(false);
      setUserReaction(null);
      localStorage.removeItem('wedding_reaction');
    } else {
      setHasReacted(true);
      setUserReaction(newEmoji);
      localStorage.setItem('wedding_reaction', newEmoji);
    }

    await fetch('/api/reactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-token': token
      },
      body: JSON.stringify({ emoji: newEmoji })
    });
  };

  return (
    <section id="rsvp" className="relative py-20 px-6 bg-crimson-50 overflow-hidden">
      <div className="max-w-lg mx-auto">
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-2">
              RSVP & Wishes
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-crimson-800 mb-4">
              Ucapan & Doa
            </h2>
            <div className="ornament-divider">
              <span className="text-gold-400">
                <MessageCircle size={16} />
              </span>
            </div>
          </div>
        </AnimatedSection>

        {/* Emoji Reactions */}
        <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 max-w-sm mx-auto">
            {reactionOptions.map(({ emoji, label }) => {
              const reaction = reactions.find((r) => r.emoji === emoji);
              const displayCount = reaction && typeof reaction.count === 'number' && !isNaN(reaction.count) 
                ? reaction.count 
                : 0;

              return (
                <motion.button
                  key={emoji}
                  whileTap={!hasReacted ? { scale: 1.2 } : {}}
                  animate={clickedEmoji === emoji ? { scale: [1, 1.3, 1] } : {}}
                  onClick={() => handleReaction(emoji)}
                  className={`flex flex-col items-center gap-0.5 p-2.5 min-w-[56px] rounded-2xl
                    backdrop-blur-md border transition-all duration-200
                    shadow-sm ${
                      userReaction === emoji 
                        ? 'bg-gold-100/80 border-gold-300 shadow-md ring-2 ring-gold-200/50' 
                        : 'bg-white/60 border-crimson-200/50 hover:bg-white/80'
                    } ${hasReacted && userReaction !== emoji ? 'opacity-50 grayscale' : ''}`}
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className={`text-[11px] font-bold ${
                    userReaction === emoji ? 'text-gold-700' : 'text-crimson-600'
                  }`}>
                    {displayCount}
                  </span>
                  <span className={`text-[9px] font-medium tracking-wide ${
                    userReaction === emoji ? 'text-gold-600' : 'text-crimson-400'
                  }`}>
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </AnimatedSection>

        {/* RSVP Form */}
        <AnimatedSection delay={0.2}>
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-crimson-600" />
              <h3 className="text-lg font-serif text-crimson-800">Konfirmasi Kehadiran</h3>
            </div>
            <form onSubmit={handleRsvpSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Anda"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-crimson-50 border border-crimson-200
                  text-crimson-800 text-sm placeholder:text-crimson-400
                  focus:outline-none focus:ring-2 focus:ring-crimson-400/50 focus:border-crimson-400
                  transition-all duration-200"
              />
              <select
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-crimson-50 border border-crimson-200
                  text-crimson-800 text-sm
                  focus:outline-none focus:ring-2 focus:ring-crimson-400/50 focus:border-crimson-400
                  transition-all duration-200"
              >
                <option value="hadir">✅ Hadir</option>
                <option value="tidak_hadir">❌ Tidak Hadir</option>
              </select>
              {attendance === 'hadir' && (
                <div>
                  <label className="text-crimson-600 text-xs mb-1 block">Jumlah Tamu</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-crimson-50 border border-crimson-200
                      text-crimson-800 text-sm
                      focus:outline-none focus:ring-2 focus:ring-crimson-400/50 focus:border-crimson-400
                      transition-all duration-200"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={rsvpSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                  bg-crimson-600 text-white text-sm font-medium tracking-wider
                  hover:bg-crimson-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-300"
              >
                <Send size={16} />
                {rsvpSubmitting ? 'Mengirim...' : 'Kirim RSVP'}
              </button>
            </form>
          </div>
        </AnimatedSection>

        {/* Wishes Form */}
        <AnimatedSection delay={0.3}>
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle size={18} className="text-crimson-600" />
              <h3 className="text-lg font-serif text-crimson-800">Kirim Ucapan</h3>
            </div>
            <form onSubmit={handleWishSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Anda"
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                required
                maxLength={50}
                readOnly={hasSession}
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200
                  ${hasSession 
                    ? 'bg-crimson-100/50 border-crimson-200 text-crimson-600 cursor-not-allowed' 
                    : 'bg-crimson-50 border-crimson-200 text-crimson-800 placeholder:text-crimson-400 focus:outline-none focus:ring-2 focus:ring-crimson-400/50 focus:border-crimson-400'
                  }`}
              />
              <div className="relative">
                <textarea
                  placeholder="Tuliskan ucapan & doa untuk kedua mempelai..."
                  value={wishMessage}
                  onChange={(e) => setWishMessage(e.target.value)}
                  rows={4}
                  required
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl bg-crimson-50 border border-crimson-200
                    text-crimson-800 text-sm placeholder:text-crimson-400 resize-none
                    focus:outline-none focus:ring-2 focus:ring-crimson-400/50 focus:border-crimson-400
                    transition-all duration-200"
                />
                <span className={`absolute bottom-2 right-3 text-[10px] ${
                  wishMessage.length >= 180 ? 'text-red-400' : 'text-crimson-400'
                }`}>
                  {wishMessage.length}/200
                </span>
              </div>
              <button
                type="submit"
                disabled={wishSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                  bg-crimson-600 text-white text-sm font-medium tracking-wider
                  hover:bg-crimson-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-300"
              >
                <Send size={16} />
                {wishSubmitting ? 'Mengirim...' : 'Kirim Ucapan'}
              </button>
            </form>
          </div>
        </AnimatedSection>

        {/* Wishes Feed */}
        <AnimatedSection delay={0.4}>
          <div className="glass-card p-6">
            <h3 className="text-lg font-serif text-crimson-800 mb-4">
              {initialLoading ? 'Memuat ucapan...' : `${totalCount} Ucapan & Doa`}
            </h3>

            <div className="space-y-4">
              {/* Loading awal - Skeleton */}
              {initialLoading ? (
                <div className="space-y-4">
                  <WishSkeleton />
                  <WishSkeleton />
                  <WishSkeleton />
                </div>
              ) : wishes.length === 0 ? (
                /* Empty state */
                <div className="text-center py-10">
                  <p className="text-crimson-400 text-sm mb-1">
                    Belum ada ucapan.
                  </p>
                  <p className="text-crimson-400/70 text-xs">
                    Jadilah yang pertama memberikan doa untuk Asmunandar & Salasatin 💌
                  </p>
                </div>
              ) : (
                /* Wishes list */
                <>
                  <AnimatePresence initial={false}>
                    {wishes.map((wish) => (
                      <motion.div
                        key={wish.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-crimson-50/60 border border-crimson-100"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-crimson-800 text-sm font-medium">{wish.name}</p>
                          <p className="text-crimson-400 text-[10px]">
                            {formatRelativeTime(wish.created_at)}
                          </p>
                        </div>
                        <p className="text-crimson-600 text-sm leading-relaxed">
                          {wish.message}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Load More Button */}
                  {hasMore && (
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                        border border-crimson-200 text-crimson-600 text-sm font-medium
                        hover:bg-crimson-100/50 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 mt-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Memuat...
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Muat Lebih Banyak
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>

      <Toast message={toastMessage} isVisible={showToast} />
    </section>
  );
}
