'use client';

import { Suspense } from 'react';
import TicketBottomSheet from '@/components/ui/TicketBottomSheet';

/**
 * Strictly isolated client-side wrapper for the ticket bottom sheet.
 * Uses its own <Suspense> boundary to safely call useSearchParams
 * without triggering hydration errors on the parent page.
 */
export default function FloatingTicket() {
  return (
    <Suspense fallback={null}>
      <TicketBottomSheet />
    </Suspense>
  );
}
