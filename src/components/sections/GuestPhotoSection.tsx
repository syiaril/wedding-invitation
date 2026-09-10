'use client';

import { Camera } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import GuestPhotoWelcome from '@/components/guest-photos/GuestPhotoWelcome';
import GuestPhotoDashboard from '@/components/guest-photos/GuestPhotoDashboard';
import { useGuestPhotoSession } from '@/hooks/useGuestPhotoSession';

export default function GuestPhotoSection() {
  const {
    isLoading,
    hasSession,
    session,
    photos,
    isLoadingPhotos,
    createSession,
    isCreating,
    refreshPhotos,
    incrementPhotoCount,
  } = useGuestPhotoSession();

  const handleUploadSuccess = (count: number) => {
    incrementPhotoCount(count);
    refreshPhotos();
  };

  return (
    <section
      id="guest-photos"
      className="relative py-20 px-6 bg-earth-50 overflow-hidden"
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-2">
              Bagikan Kenanganmu
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-sage-800 mb-4">
              Abadikan Momen
            </h2>
            <div className="ornament-divider">
              <span className="text-gold-400">
                <Camera size={16} />
              </span>
            </div>
          </div>
        </AnimatedSection>

        {/* Content */}
        <AnimatedSection delay={0.2}>
          <div className="glass-card p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div
                  className="w-8 h-8 border-2 border-sage-300 border-t-sage-600
                    rounded-full animate-spin mx-auto mb-3"
                />
                <p className="text-sage-400 text-xs">
                  Memuat sesi foto...
                </p>
              </div>
            ) : hasSession && session ? (
              <GuestPhotoDashboard
                guestName={session.guestName}
                photoCount={session.photoCount}
                sessionToken={session.sessionToken}
                photos={photos}
                isLoadingPhotos={isLoadingPhotos}
                onUploadSuccess={handleUploadSuccess}
              />
            ) : (
              <GuestPhotoWelcome
                onSubmit={createSession}
                isSubmitting={isCreating}
              />
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
