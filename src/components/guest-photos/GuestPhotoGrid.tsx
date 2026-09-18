'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

interface GuestPhoto {
  id: string;
  signed_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface GuestPhotoGridProps {
  photos: GuestPhoto[];
  isLoading: boolean;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Sedang Ditinjau',
    className: 'bg-amber-500/10 text-amber-500 border-amber-200',
    iconColor: 'text-amber-500',
  },
  approved: {
    icon: CheckCircle2,
    label: 'Ditampilkan',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    iconColor: 'text-emerald-500',
  },
  rejected: {
    icon: XCircle,
    label: 'Tidak Ditampilkan',
    className: 'bg-red-400/10 text-red-400 border-red-200',
    iconColor: 'text-red-400',
  },
};

export default function GuestPhotoGrid({
  photos,
  isLoading,
}: GuestPhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <div className="w-8 h-8 border-2 border-crimson-300 border-t-crimson-600
          rounded-full animate-spin mx-auto mb-3" />
        <p className="text-crimson-400 text-xs">Memuat kenanganmu...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-crimson-400 text-sm">
          Belum ada foto. Mulai abadikan momenmu! 📸
        </p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-crimson-700 text-xs font-semibold tracking-wide uppercase mb-3">
        Foto Saya
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => {
          const config = statusConfig[photo.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setLightboxIndex(index)}
              className="relative aspect-square rounded-lg overflow-hidden bg-crimson-100 group cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.signed_url}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />

              {/* Status badge */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent
                pt-6 pb-1.5 px-1.5">
                <div className={`inline-flex items-center gap-1 px-1.5 py-0.5
                  rounded-full text-[9px] font-medium border ${config.className} bg-black/60 backdrop-blur-sm`}
                >
                  <StatusIcon size={10} />
                  {config.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex >= 0 ? lightboxIndex : 0}
        slides={photos.map((p) => ({ src: p.signed_url }))}
        plugins={[Zoom]}
        carousel={{ finite: true }}
        render={{
          buttonPrev: photos.length <= 1 ? () => null : undefined,
          buttonNext: photos.length <= 1 ? () => null : undefined,
        }}
      />
    </div>
  );
}
