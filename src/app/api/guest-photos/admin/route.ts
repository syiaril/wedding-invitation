import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GUEST_PHOTO_BUCKET, SIGNED_URL_EXPIRY } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function verifyAdminPin(request: Request): boolean {
  const pin = request.headers.get('x-admin-pin');
  const correctPin = process.env.RECEPTIONIST_PIN || '1818';
  return typeof pin === 'string' && pin.trim() === correctPin.trim();
}

export async function GET(request: Request) {
  try {
    if (!verifyAdminPin(request)) {
      return NextResponse.json({ error: 'PIN tidak valid atau tidak diberikan.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('guest_photos')
      .select('*, photo_sessions!inner(guest_name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: photos, error } = await query;

    if (error) {
      console.error('Error fetching photos:', error);
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
          status: photo.status,
          file_size: photo.file_size,
          mime_type: photo.mime_type,
          created_at: photo.created_at
        };
      })
    );

    return NextResponse.json({ photos: photosWithUrls });
  } catch (error) {
    console.error('Error in admin GET handler:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!verifyAdminPin(request)) {
      return NextResponse.json({ error: 'PIN tidak valid atau tidak diberikan.' }, { status: 401 });
    }

    const body = await request.json();
    const { photo_id, status } = body;

    if (!photo_id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('guest_photos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', photo_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating photo status:', error);
      return NextResponse.json({ error: 'Gagal memperbarui status foto.' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in admin PATCH handler:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!verifyAdminPin(request)) {
      return NextResponse.json({ error: 'PIN tidak valid atau tidak diberikan.' }, { status: 401 });
    }

    const body = await request.json();
    const { photo_id } = body;

    if (!photo_id) {
      return NextResponse.json({ error: 'ID Foto tidak diberikan.' }, { status: 400 });
    }

    const { data: photo, error: fetchError } = await supabaseAdmin
      .from('guest_photos')
      .select('storage_path, session_id')
      .eq('id', photo_id)
      .single();

    if (fetchError || !photo) {
      console.error('Error fetching photo before delete:', fetchError);
      return NextResponse.json({ error: 'Foto tidak ditemukan.' }, { status: 404 });
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from(GUEST_PHOTO_BUCKET)
      .remove([photo.storage_path]);

    if (storageError) {
      console.error('Error deleting file from storage (continuing with DB deletion):', storageError);
    }

    const { error: deleteError } = await supabaseAdmin
      .from('guest_photos')
      .delete()
      .eq('id', photo_id);

    if (deleteError) {
      console.error('Error deleting photo record:', deleteError);
      return NextResponse.json({ error: 'Gagal menghapus data foto.' }, { status: 500 });
    }

    const { error: rpcError } = await supabaseAdmin.rpc('release_photo_slot', { p_session_id: photo.session_id });
    if (rpcError) {
      console.error('Error releasing photo slot:', rpcError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin DELETE handler:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
