'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ImagePlus, Send, X, Loader2, Plus } from 'lucide-react';
import { compressImage } from '@/lib/image-utils';
import { MAX_PHOTO_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants';

interface PhotoUploaderProps {
  sessionToken: string;
  canUpload: boolean;
  remainingSlots: number;
  onUploadSuccess: (count: number) => void;
  onError: (message: string) => void;
}

interface SelectedPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

type UploaderState = 'idle' | 'staging' | 'uploading';

export default function PhotoUploader({
  sessionToken,
  canUpload,
  remainingSlots,
  onUploadSuccess,
  onError,
}: PhotoUploaderProps) {
  const [state, setState] = useState<UploaderState>('idle');
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const clearAll = useCallback(() => {
    selectedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setSelectedPhotos([]);
    setState('idle');
    setUploadProgress(0);
    setUploadStatusText('');
  }, [selectedPhotos]);

  const removePhoto = useCallback((idToRemove: string) => {
    setSelectedPhotos((prev) => {
      const p = prev.find(p => p.id === idToRemove);
      if (p) URL.revokeObjectURL(p.previewUrl);
      
      const newArr = prev.filter(p => p.id !== idToRemove);
      if (newArr.length === 0) {
        setState('idle');
      }
      return newArr;
    });
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      e.target.value = ''; // Reset

      if (selectedPhotos.length + files.length > remainingSlots) {
        onError(`Maksimal kamu hanya bisa menambah ${remainingSlots} foto lagi.`);
        return;
      }

      const newPhotos: SelectedPhoto[] = [];
      let sizeError = false;
      let typeError = false;

      for (const file of files) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
          typeError = true;
          continue;
        }
        if (file.size > MAX_PHOTO_SIZE) {
          sizeError = true;
          continue;
        }
        
        newPhotos.push({
          id: Math.random().toString(36).substring(7),
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }

      if (typeError) onError('Beberapa file diabaikan karena bukan gambar yang valid.');
      if (sizeError) onError('Beberapa foto diabaikan karena ukuran terlalu besar.');

      if (newPhotos.length > 0) {
        setSelectedPhotos((prev) => [...prev, ...newPhotos]);
        setState('staging');
      }
    },
    [onError, remainingSlots, selectedPhotos.length]
  );

  const handleUpload = useCallback(async () => {
    if (selectedPhotos.length === 0 || !canUpload) return;

    setState('uploading');
    let successCount = 0;
    let limitReached = false;
    const total = selectedPhotos.length;

    for (let i = 0; i < total; i++) {
      const photo = selectedPhotos[i];
      setUploadStatusText(`Mengunggah foto ${i + 1} dari ${total}...`);
      setUploadProgress(Math.round(((i) / total) * 100));

      try {
        const compressed = await compressImage(photo.file);
        const formData = new FormData();
        formData.append('photo', compressed, 'photo.webp');

        const res = await fetch('/api/guest-photos/upload', {
          method: 'POST',
          headers: { 'x-session-token': sessionToken },
          body: formData,
        });

        if (res.ok) {
          successCount++;
        } else {
          const data = await res.json();
          if (data.error && data.error.toLowerCase().includes('batas')) {
            limitReached = true;
            break;
          }
        }
      } catch (err) {
        console.error('Upload failed for a photo', err);
      }
      
      setUploadProgress(Math.round(((i + 1) / total) * 100));
    }

    // Done uploading
    clearAll();

    if (successCount > 0) {
      if (limitReached) {
        onError(`Berhasil mengunggah ${successCount} foto. Sisanya ditolak karena mencapai batas.`);
      }
      onUploadSuccess(successCount);
    } else {
      onError('Gagal mengunggah foto. Silakan coba lagi nanti.');
    }
  }, [selectedPhotos, canUpload, sessionToken, clearAll, onUploadSuccess, onError]);

  if (!canUpload && state === 'idle') {
    return (
      <div className="text-center py-4">
        <p className="text-sage-500 text-sm">
          Kamu sudah mencapai batas maksimal foto. 🎉
        </p>
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.div
            key="buttons"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-2 gap-3"
          >
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-5 rounded-xl
                bg-sage-50 border border-sage-200
                hover:bg-sage-100 hover:border-sage-300
                active:scale-[0.97] transition-all duration-200"
            >
              <Camera size={24} className="text-sage-600" />
              <span className="text-sage-700 text-xs font-medium">
                Kamera
              </span>
            </button>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-5 rounded-xl
                bg-sage-50 border border-sage-200
                hover:bg-sage-100 hover:border-sage-300
                active:scale-[0.97] transition-all duration-200"
            >
              <ImagePlus size={24} className="text-sage-600" />
              <span className="text-sage-700 text-xs font-medium">
                Galeri
              </span>
            </button>
          </motion.div>
        )}

        {(state === 'staging' || state === 'uploading') && (
          <motion.div
            key="staging"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Staging Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <AnimatePresence>
                {selectedPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-xl overflow-hidden bg-sage-100 border border-sage-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    
                    {state === 'staging' && (
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full
                          bg-red-500/80 backdrop-blur-sm flex items-center justify-center
                          text-white hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </motion.div>
                ))}

                {/* Add more button (only in staging and if not at limit) */}
                {state === 'staging' && selectedPhotos.length < remainingSlots && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="aspect-square flex flex-col gap-2 rounded-xl border-2 border-dashed border-sage-300 bg-sage-50 hover:bg-sage-100 transition-colors"
                  >
                    <button
                      onClick={() => galleryInputRef.current?.click()}
                      className="flex-1 flex flex-col items-center justify-center text-sage-600 border-b border-sage-200/50"
                    >
                      <ImagePlus size={20} className="mb-1" />
                      <span className="text-[10px] font-medium">Galeri</span>
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 flex flex-col items-center justify-center text-sage-600"
                    >
                      <Camera size={20} className="mb-1" />
                      <span className="text-[10px] font-medium">Kamera</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Uploading Overlay / Progress */}
            {state === 'uploading' && (
              <div className="bg-sage-100/50 border border-sage-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                <Loader2 size={24} className="text-sage-600 animate-spin" />
                <p className="text-sage-700 text-sm font-medium">
                  {uploadStatusText}
                </p>
                <div className="w-full h-1.5 bg-sage-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-sage-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Staging Actions */}
            {state === 'staging' && (
              <div className="flex gap-3">
                <button
                  onClick={clearAll}
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-sage-200 text-sage-600 text-sm font-medium hover:bg-sage-50 active:scale-[0.98] transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpload}
                  className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 active:scale-[0.98] transition-all shadow-sm"
                >
                  <Send size={16} />
                  Kirim ({selectedPhotos.length} Foto)
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
