'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Check,
  X,
  Trash2,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminPhoto {
  id: string;
  guest_name: string;
  signed_url: string;
  status: 'pending' | 'approved' | 'rejected';
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

interface GuestPhotoAdminProps {
  adminPin: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'rejected', label: 'Ditolak' },
];

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  approved: {
    icon: CheckCircle2,
    label: 'Approved',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-50',
  },
};

export default function GuestPhotoAdmin({ adminPin }: GuestPhotoAdminProps) {
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToastMsg = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') => {
      setToastMessage(msg);
      setToastType(type);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    []
  );

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);

      const res = await fetch(`/api/guest-photos/admin?${params.toString()}`, {
        headers: { 'x-admin-pin': adminPin },
      });

      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch {
      showToastMsg('Gagal memuat foto.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [adminPin, filter, showToastMsg]);

  useEffect(() => {
    void (async () => {
      await fetchPhotos();
    })();
  }, [fetchPhotos]);

  // Realtime subscription for new uploads
  useEffect(() => {
    const channel = supabase
      .channel('admin-guest-photos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'guest_photos' },
        () => {
          // Refresh when new photos are uploaded
          void (async () => {
            await fetchPhotos();
          })();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPhotos]);

  const handleUpdateStatus = useCallback(
    async (photoId: string, status: 'approved' | 'rejected') => {
      setActionLoading(photoId);
      try {
        const res = await fetch('/api/guest-photos/admin', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-pin': adminPin,
          },
          body: JSON.stringify({ photo_id: photoId, status }),
        });

        if (res.ok) {
          setPhotos((prev) =>
            prev.map((p) => (p.id === photoId ? { ...p, status } : p))
          );
          showToastMsg(
            status === 'approved' ? 'Foto disetujui ✓' : 'Foto ditolak ✕'
          );
        } else {
          showToastMsg('Gagal memperbarui status.', 'error');
        }
      } catch {
        showToastMsg('Terjadi kesalahan.', 'error');
      } finally {
        setActionLoading(null);
      }
    },
    [adminPin, showToastMsg]
  );

  const handleDelete = useCallback(
    async (photoId: string) => {
      if (!confirm('Hapus foto ini? Tindakan ini tidak dapat dibatalkan.')) return;

      setActionLoading(photoId);
      try {
        const res = await fetch('/api/guest-photos/admin', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-pin': adminPin,
          },
          body: JSON.stringify({ photo_id: photoId }),
        });

        if (res.ok) {
          setPhotos((prev) => prev.filter((p) => p.id !== photoId));
          showToastMsg('Foto dihapus.');
        } else {
          showToastMsg('Gagal menghapus foto.', 'error');
        }
      } catch {
        showToastMsg('Terjadi kesalahan.', 'error');
      } finally {
        setActionLoading(null);
      }
    },
    [adminPin, showToastMsg]
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
              transition-all duration-200 ${
                filter === key
                  ? 'bg-sage-600 text-white'
                  : 'bg-sage-50 text-sage-600 border border-sage-200 hover:bg-sage-100'
              }`}
          >
            {key === 'all' ? (
              <span className="flex items-center gap-1">
                <Filter size={12} />
                {label}
              </span>
            ) : (
              label
            )}
          </button>
        ))}
      </div>

      {/* Photo count */}
      <p className="text-sage-400 text-[11px]">
        {photos.length} foto{filter !== 'all' ? ` (${filter})` : ''}
      </p>

      {/* Photo list */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 size={24} className="text-sage-400 animate-spin mx-auto mb-2" />
          <p className="text-sage-400 text-sm">Memuat foto...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-8">
          <ImageIcon size={32} className="text-sage-300 mx-auto mb-2" />
          <p className="text-sage-400 text-sm">Belum ada foto.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {photos.map((photo) => {
            const config = statusConfig[photo.status];
            const StatusIcon = config.icon;
            const isProcessing = actionLoading === photo.id;

            return (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-white rounded-xl border border-sage-100 overflow-hidden shadow-sm"
              >
                <div className="flex gap-3 p-3">
                  {/* Thumbnail */}
                  <button
                    onClick={() => setPreviewUrl(photo.signed_url)}
                    className="relative w-20 h-20 rounded-lg overflow-hidden bg-sage-100
                      flex-shrink-0 group cursor-pointer"
                    aria-label="Preview foto"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.signed_url}
                      alt="Guest photo"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20
                      flex items-center justify-center transition-colors">
                      <Eye
                        size={16}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sage-800 text-sm font-medium truncate">
                      {photo.guest_name}
                    </p>
                    <p className="text-sage-400 text-[11px] mt-0.5">
                      {formatDate(photo.created_at)} • {formatTime(photo.created_at)}
                    </p>
                    <div
                      className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5
                        rounded-full text-[10px] font-medium ${config.bg} ${config.color}`}
                    >
                      <StatusIcon size={10} />
                      {config.label}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-sage-50">
                  {photo.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(photo.id, 'approved')}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                        text-emerald-600 text-xs font-medium
                        hover:bg-emerald-50 disabled:opacity-50
                        transition-colors border-r border-sage-50"
                    >
                      {isProcessing ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      Approve
                    </button>
                  )}
                  {photo.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(photo.id, 'rejected')}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                        text-amber-600 text-xs font-medium
                        hover:bg-amber-50 disabled:opacity-50
                        transition-colors border-r border-sage-50"
                    >
                      {isProcessing ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <X size={13} />
                      )}
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5
                      text-red-400 text-xs font-medium
                      hover:bg-red-50 disabled:opacity-50
                      transition-colors"
                  >
                    {isProcessing ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Hapus
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Preview Lightbox */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPreviewUrl(null)}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full
                bg-white/10 backdrop-blur-md flex items-center justify-center
                text-white hover:bg-white/20 transition-colors"
              aria-label="Tutup preview"
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
              ${toastType === 'error' ? 'bg-red-600 text-white' : 'bg-sage-700 text-white'}`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
