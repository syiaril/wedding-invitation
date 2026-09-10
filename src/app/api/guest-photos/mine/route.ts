export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GUEST_PHOTO_BUCKET, SIGNED_URL_EXPIRY } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    const sessionToken = request.headers.get('x-session-token');

    if (!sessionToken) {
      return NextResponse.json({ error: 'Token sesi tidak ditemukan' }, { status: 401 });
    }

    // Find session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('photo_sessions')
      .select('id')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau telah kadaluarsa' }, { status: 401 });
    }

    const sessionId = session.id;

    // Fetch photos
    const { data: photos, error: photosError } = await supabaseAdmin
      .from('guest_photos')
      .select('id, storage_path, status, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (photosError) {
      console.error('Error fetching photos:', photosError);
      return NextResponse.json({ error: 'Gagal mengambil data foto' }, { status: 500 });
    }

    // Generate signed URLs
    const photosWithUrls = await Promise.all(
      (photos || []).map(async (photo) => {
        const { data: urlData, error: urlError } = await supabaseAdmin.storage
          .from(GUEST_PHOTO_BUCKET)
          .createSignedUrl(photo.storage_path, SIGNED_URL_EXPIRY);

        if (urlError) {
          console.error(`Error generating signed URL for photo ${photo.id}:`, urlError);
        }

        return {
          id: photo.id,
          status: photo.status,
          created_at: photo.created_at,
          signed_url: urlData?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({ photos: photosWithUrls });

  } catch (error: unknown) {
    console.error('Mine handler error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
