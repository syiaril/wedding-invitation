'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MusicProvider } from '@/context/MusicContext';
import { InvitationProvider, useInvitation } from '@/context/InvitationContext';
import MusicToggle from '@/components/ui/MusicToggle';
import DoorSection from '@/components/sections/DoorSection';
import HeroSection from '@/components/sections/HeroSection';
import OpeningSection from '@/components/sections/OpeningSection';
import EventSection from '@/components/sections/EventSection';
import LocationSection from '@/components/sections/LocationSection';
import LoveStorySection from '@/components/sections/LoveStorySection';
import GallerySection from '@/components/sections/GallerySection';
import GiftSection from '@/components/sections/GiftSection';
import RSVPSection from '@/components/sections/RSVPSection';
import ClosingSection from '@/components/sections/ClosingSection';
import FloatingTicket from '@/components/ui/FloatingTicket';

function InvitationContent() {
  const { isOpen } = useInvitation();

  return (
    <>
      <DoorSection />

      {isOpen && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <HeroSection />
          <OpeningSection />
          <EventSection />
          <LocationSection />
          <LoveStorySection />
          <GallerySection />
          <GiftSection />
          <RSVPSection />
          <ClosingSection />
        </motion.main>
      )}

      <MusicToggle />
      <FloatingTicket />
    </>
  );
}

function InvitationPage() {
  const searchParams = useSearchParams();
  const rawName = searchParams.get('to');
  const guestName = rawName ? decodeURIComponent(rawName) : 'Tamu Undangan';

  return (
    <MusicProvider>
      <InvitationProvider guestName={guestName}>
        <InvitationContent />
      </InvitationProvider>
    </MusicProvider>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-earth-50">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-sage-300 border-t-sage-600
              rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sage-500 text-sm font-serif">Memuat undangan...</p>
          </div>
        </div>
      }
    >
      <InvitationPage />
    </Suspense>
  );
}
