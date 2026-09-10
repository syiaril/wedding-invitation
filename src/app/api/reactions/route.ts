import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const sessionToken = request.headers.get('x-session-token');
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Token sesi tidak ditemukan' }, { status: 401 });
    }

    const body = await request.json();
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji wajib diisi' }, { status: 400 });
    }

    // Find session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('photo_sessions')
      .select('id')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sesi tidak valid' }, { status: 401 });
    }

    // Call RPC to toggle reaction atomically
    const { error: rpcError } = await supabaseAdmin.rpc('toggle_reaction', {
      p_session_id: session.id,
      p_emoji: emoji
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      return NextResponse.json({ error: 'Gagal memperbarui reaksi' }, { status: 500 });
    }

    // Fetch the new counts to return to client (optional, but good for sync)
    const { data: reactions } = await supabaseAdmin
      .from('reactions')
      .select('emoji, count');

    return NextResponse.json({ success: true, reactions });

  } catch (error: unknown) {
    console.error('Reactions handler error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
