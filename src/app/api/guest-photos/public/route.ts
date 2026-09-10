import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GUEST_PHOTO_BUCKET, SIGNED_URL_EXPIRY } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let query = supabaseAdmin
      .from('guest_photos')
      .select('*, photo_sessions!inner(guest_name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: photos, error } = await query;

    if (error) {
      console.error('Error fetching public photos:', error);
      return NextResponse.json({ error: 'Gagal mengambil data foto.' }, { status: 500 });
    }

    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        const { data: urlData, error: urlError } = await supabaseAdmin.storage
          .from(GUEST_PHOTO_BUCKET)
          .createSignedUrl(photo.storage_path, SIGNED_URL_EXPIRY || 3600);
        
        return {
          id: photo.id,
          guest_name: photo.photo_sessions.guest_name,
          signed_url: urlError ? null : urlData?.signedUrl,
          created_at: photo.created_at
        };
      })
    );

    const next_cursor = photos.length > 0 ? photos[photos.length - 1].created_at : null;

    return NextResponse.json({ photos: photosWithUrls, next_cursor });
  } catch (error) {
    console.error('Error in public GET handler:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
