import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const sessionToken = request.headers.get('x-session-token');
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Token sesi tidak ditemukan. Silakan isi nama Anda terlebih dahulu.' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Pesan ucapan tidak boleh kosong' }, { status: 400 });
    }

    // Find session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('photo_sessions')
      .select('id, guest_name')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 });
    }

    // Insert wish
    const { error: insertError } = await supabaseAdmin
      .from('wishes')
      .insert({
        session_id: session.id,
        name: session.guest_name,
        message: message.trim()
      });

    if (insertError) {
      console.error('Insert Wish Error:', insertError);
      return NextResponse.json({ error: 'Gagal mengirim ucapan' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Wishes handler error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
