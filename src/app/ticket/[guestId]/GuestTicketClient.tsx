'use client';

import GuestTicket from '@/components/ui/GuestTicket';

interface GuestTicketClientProps {
  guestId: string;
  guestName: string;
  category: string;
  kodeTiket: string;
}

export default function GuestTicketClient({
  guestId,
  guestName,
  category,
  kodeTiket,
}: GuestTicketClientProps) {
  return (
    <GuestTicket
      guestId={guestId}
      guestName={guestName}
      category={category}
      kodeTiket={kodeTiket}
    />
  );
}
