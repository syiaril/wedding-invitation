import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GUEST_PHOTO_LIMIT } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_token } = body;

    if (!session_token || typeof session_token !== 'string') {
      return NextResponse.json(
        { error: 'Token sesi tidak valid' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('photo_sessions')
      .select('id, guest_name, photo_count')
      .eq('session_token', session_token)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { valid: false, error: 'Sesi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      guest_name: data.guest_name,
      photo_count: data.photo_count,
      photo_limit: GUEST_PHOTO_LIMIT,
      session_id: data.id
    });

  } catch (error) {
    console.error('Error in POST /api/guest-photos/session/validate:', error);
    return NextResponse.json(
      { error: 'Permintaan tidak valid' },
      { status: 400 }
    );
  }
}
