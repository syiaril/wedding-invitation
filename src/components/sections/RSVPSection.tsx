'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, MessageCircle } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Toast from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

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

const reactionOptions = [
  { emoji: '👍', label: 'Upvote' },
  { emoji: '😆', label: 'Funny' },
  { emoji: '😍', label: 'Love' },
  { emoji: '😮', label: 'Surprised' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😢', label: 'Sad' },
];

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

  // Fetch wishes
  const fetchWishes = useCallback(async () => {
    const { data } = await supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setWishes(data);
  }, []);

  // Fetch reactions
  const fetchReactions = useCallback(async () => {
    const { data } = await supabase
      .from('reactions')
      .select('*')
      .order('emoji');
    if (data) setReactions(data);
  }, []);

  useEffect(() => {
    fetchWishes();
    fetchReactions();

    // Check if user has already reacted
    const savedReaction = localStorage.getItem('wedding_reaction');
    if (savedReaction) {
      setHasReacted(true);
      setUserReaction(savedReaction);
    }
  }, [fetchWishes, fetchReactions]);

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
    const { error } = await supabase.from('wishes').insert({
      name: wishName.trim(),
      message: wishMessage.trim(),
    });
    setWishSubmitting(false);

    if (!error) {
      showToastMsg('Ucapan berhasil dikirim! 💌');
      setWishName('');
      setWishMessage('');
      fetchWishes();
    }
  };

  // Handle reaction
  const handleReaction = async (emoji: string) => {
    // If clicking same reaction, do nothing
    if (userReaction === emoji) return;

    setClickedEmoji(emoji);
    setTimeout(() => setClickedEmoji(null), 600);

    const oldEmoji = userReaction;
    const newEmoji = emoji;

    // Optimistic local update (handling missing emojis safely)
    setReactions((prev) => {
      let nextState = [...prev];
      if (!nextState.find(r => r.emoji === newEmoji)) {
        nextState.push({ id: Math.random().toString(), emoji: newEmoji, count: 0 });
      }
      return nextState.map((r) => {
        if (r.emoji === newEmoji) return { ...r, count: (r.count || 0) + 1 };
        if (r.emoji === oldEmoji) return { ...r, count: Math.max(0, (r.count || 0) - 1) };
        return r;
      });
    });

    setHasReacted(true);
    setUserReaction(newEmoji);
    localStorage.setItem('wedding_reaction', newEmoji);

    // Supabase updates
    if (oldEmoji) {
      const oldReaction = reactions.find(r => r.emoji === oldEmoji);
      if (oldReaction) {
        await supabase
          .from('reactions')
          .update({ count: Math.max(0, oldReaction.count - 1) })
          .eq('emoji', oldEmoji);
      }
    }

    const currentNewReaction = reactions.find(r => r.emoji === newEmoji);
    if (currentNewReaction) {
      // Exists in DB, update
      await supabase
        .from('reactions')
        .update({ count: (currentNewReaction.count || 0) + 1 })
        .eq('emoji', newEmoji);
    } else {
      // First time this emoji is clicked ever, insert it
      await supabase
        .from('reactions')
        .insert({ emoji: newEmoji, count: 1 });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section id="rsvp" className="relative py-20 px-6 bg-sage-50 overflow-hidden">
      <div className="max-w-lg mx-auto">
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-2">
              RSVP & Wishes
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-sage-800 mb-4">
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
              // Ensure we display 0 instead of nothing if count is somehow undefined or NaN
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
                        : 'bg-white/60 border-sage-200/50 hover:bg-white/80'
                    } ${hasReacted && userReaction !== emoji ? 'opacity-50 grayscale' : ''}`}
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className={`text-[11px] font-bold ${
                    userReaction === emoji ? 'text-gold-700' : 'text-sage-600'
                  }`}>
                    {displayCount}
                  </span>
                  <span className={`text-[9px] font-medium tracking-wide ${
                    userReaction === emoji ? 'text-gold-600' : 'text-sage-400'
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
              <Users size={18} className="text-sage-600" />
              <h3 className="text-lg font-serif text-sage-800">Konfirmasi Kehadiran</h3>
            </div>
            <form onSubmit={handleRsvpSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Anda"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-sage-50 border border-sage-200
                  text-sage-800 text-sm placeholder:text-sage-400
                  focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400
                  transition-all duration-200"
              />
              <select
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-sage-50 border border-sage-200
                  text-sage-800 text-sm
                  focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400
                  transition-all duration-200"
              >
                <option value="hadir">✅ Hadir</option>
                <option value="tidak_hadir">❌ Tidak Hadir</option>
              </select>
              {attendance === 'hadir' && (
                <div>
                  <label className="text-sage-600 text-xs mb-1 block">Jumlah Tamu</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-sage-50 border border-sage-200
                      text-sage-800 text-sm
                      focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400
                      transition-all duration-200"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={rsvpSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                  bg-sage-600 text-white text-sm font-medium tracking-wider
                  hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed
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
              <MessageCircle size={18} className="text-sage-600" />
              <h3 className="text-lg font-serif text-sage-800">Kirim Ucapan</h3>
            </div>
            <form onSubmit={handleWishSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nama Anda"
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-sage-50 border border-sage-200
                  text-sage-800 text-sm placeholder:text-sage-400
                  focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400
                  transition-all duration-200"
              />
              <div className="relative">
                <textarea
                  placeholder="Tuliskan ucapan & doa untuk kedua mempelai..."
                  value={wishMessage}
                  onChange={(e) => setWishMessage(e.target.value)}
                  rows={4}
                  required
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl bg-sage-50 border border-sage-200
                    text-sage-800 text-sm placeholder:text-sage-400 resize-none
                    focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400
                    transition-all duration-200"
                />
                <span className={`absolute bottom-2 right-3 text-[10px] ${
                  wishMessage.length >= 180 ? 'text-red-400' : 'text-sage-400'
                }`}>
                  {wishMessage.length}/200
                </span>
              </div>
              <button
                type="submit"
                disabled={wishSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                  bg-sage-600 text-white text-sm font-medium tracking-wider
                  hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed
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
            <h3 className="text-lg font-serif text-sage-800 mb-4">
              Ucapan ({wishes.length})
            </h3>
            <div className="max-h-80 overflow-y-auto space-y-4 pr-2
              scrollbar-thin scrollbar-track-sage-50 scrollbar-thumb-sage-200">
              {wishes.length === 0 ? (
                <p className="text-sage-400 text-sm text-center py-8">
                  Belum ada ucapan. Jadilah yang pertama! 💌
                </p>
              ) : (
                wishes.map((wish) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-sage-50/60 border border-sage-100"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sage-800 text-sm font-medium">{wish.name}</p>
                      <p className="text-sage-400 text-[10px]">
                        {formatDate(wish.created_at)}
                      </p>
                    </div>
                    <p className="text-sage-600 text-sm leading-relaxed">
                      {wish.message}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>

      <Toast message={toastMessage} isVisible={showToast} />
    </section>
  );
}
