import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import GuestTicketClient from './GuestTicketClient';

export const metadata: Metadata = {
  title: 'E-Ticket | The Wedding of Nandar & Salsa',
  description: 'E-Ticket digital untuk acara pernikahan Nandar & Salsa. 18 Oktober 2026.',
};

interface GuestData {
  id: string;
  nama_tamu: string;
  kategori: string;
  kode_tiket: string;
}

export default async function TicketPage(props: { params: Promise<{ guestId: string }> }) {
  const { guestId } = await props.params;

  // Fetch guest data from Supabase
  const { data: guest, error } = await supabase
    .from('guest_list')
    .select('id, nama_tamu, kategori, kode_tiket')
    .eq('id', guestId)
    .single();

  if (error || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50 px-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-full bg-dusty-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎫</span>
          </div>
          <h1 className="font-serif text-sage-800 text-xl mb-2">Tiket Tidak Ditemukan</h1>
          <p className="text-sage-400 text-sm leading-relaxed">
            Maaf, tiket undangan yang Anda cari tidak tersedia atau link sudah tidak berlaku.
          </p>
        </div>
      </div>
    );
  }

  const guestData: GuestData = guest;

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50 px-4 py-8">
      <GuestTicketClient
        guestId={guestData.id}
        guestName={guestData.nama_tamu}
        category={guestData.kategori}
        kodeTiket={guestData.kode_tiket}
      />
    </div>
  );
}
