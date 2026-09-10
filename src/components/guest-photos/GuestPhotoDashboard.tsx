'use client';

import { useState, useCallback } from 'react';
import { GUEST_PHOTO_LIMIT } from '@/lib/constants';
import PhotoUploader from './PhotoUploader';
import GuestPhotoGrid from './GuestPhotoGrid';
import Toast from '@/components/ui/Toast';

interface GuestPhoto {
  id: string;
  signed_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface GuestPhotoDashboardProps {
  guestName: string;
  photoCount: number;
  sessionToken: string;
  photos: GuestPhoto[];
  isLoadingPhotos: boolean;
  onUploadSuccess: (count: number) => void;
}

export default function GuestPhotoDashboard({
  guestName,
  photoCount,
  sessionToken,
  photos,
  isLoadingPhotos,
  onUploadSuccess,
}: GuestPhotoDashboardProps) {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const remaining = GUEST_PHOTO_LIMIT - photoCount;
  const canUpload = photoCount < GUEST_PHOTO_LIMIT;
  const progressPercent = (photoCount / GUEST_PHOTO_LIMIT) * 100;

  const showToastMsg = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  const handleUploadError = useCallback(
    (message: string) => {
      showToastMsg(message);
    },
    [showToastMsg]
  );


  return (
    <div className="space-y-6">
      {/* Greeting & Counter */}
      <div className="text-center">
        <p className="text-sage-800 font-serif text-lg mb-1">
          Halo, {guestName}!
        </p>
        <p className="text-sage-500 text-xs mb-4">Foto Kamu</p>

        {/* Progress bar */}
        <div className="max-w-[200px] mx-auto mb-2">
          <div className="h-2 bg-sage-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <p className="text-sage-700 text-sm font-medium">
          {photoCount} / {GUEST_PHOTO_LIMIT} Foto
        </p>

        {canUpload ? (
          <p className="text-sage-400 text-xs mt-1">
            Kamu masih bisa mengirim {remaining} foto.
          </p>
        ) : (
          <p className="text-sage-400 text-xs mt-1">
            Kamu sudah mencapai batas maksimal foto. 🎉
          </p>
        )}
      </div>

      {/* Upload buttons */}
      <PhotoUploader
        sessionToken={sessionToken}
        canUpload={canUpload}
        remainingSlots={remaining}
        onUploadSuccess={(count) => {
          showToastMsg(`Berhasil mengirim ${count} foto! 📸`);
          onUploadSuccess(count);
        }}
        onError={handleUploadError}
      />

      {/* Divider */}
      {photos.length > 0 && (
        <div className="border-t border-sage-100" />
      )}

      {/* Photo grid */}
      <GuestPhotoGrid photos={photos} isLoading={isLoadingPhotos} />

      <Toast message={toastMessage} isVisible={showToast} />
    </div>
  );
}
