export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { 
  GUEST_PHOTO_LIMIT, 
  MAX_PHOTO_SIZE, 
  ALLOWED_IMAGE_TYPES, 
  GUEST_PHOTO_BUCKET,
  SIGNED_URL_EXPIRY
} from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const sessionToken = request.headers.get('x-session-token');

    if (!sessionToken) {
      return NextResponse.json({ error: 'Token sesi tidak ditemukan' }, { status: 401 });
    }

    // Find session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('photo_sessions')
      .select('id, session_token')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau telah kadaluarsa' }, { status: 401 });
    }

    const sessionId = session.id;

    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'File foto tidak ditemukan atau kosong' }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return NextResponse.json({ error: 'Tipe file tidak didukung' }, { status: 400 });
    }

    if (file.size > MAX_PHOTO_SIZE) {
      return NextResponse.json({ error: 'Ukuran file melebihi batas maksimal' }, { status: 400 });
    }

    // Reserve photo slot
    const { data: reserveCount, error: reserveError } = await supabaseAdmin.rpc('reserve_photo_slot', { 
      p_session_id: sessionId, 
      p_limit: GUEST_PHOTO_LIMIT 
    });

    if (reserveError) {
      console.error('Error reserving photo slot:', reserveError);
      return NextResponse.json({ error: 'Gagal mereservasi slot foto' }, { status: 500 });
    }

    if (reserveCount === -1) {
      return NextResponse.json({ error: 'Batas unggahan foto telah tercapai' }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `${sessionId}/${crypto.randomUUID()}.webp`;

    // Upload to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(GUEST_PHOTO_BUCKET)
      .upload(storagePath, buffer, { 
        contentType: file.type, 
        upsert: false 
      });

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError);
      // Rollback
      await supabaseAdmin.rpc('release_photo_slot', { p_session_id: sessionId });
      return NextResponse.json({ error: 'Gagal mengunggah foto ke penyimpanan' }, { status: 500 });
    }

    // Insert guest_photos record
    const { data: photoRecord, error: dbError } = await supabaseAdmin
      .from('guest_photos')
      .insert({
        session_id: sessionId,
        storage_path: storagePath,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        status: 'pending'
      })
      .select('id, storage_path, status, created_at')
      .single();

    if (dbError || !photoRecord) {
      console.error('Error saving to database:', dbError);
      // Rollback
      await supabaseAdmin.storage.from(GUEST_PHOTO_BUCKET).remove([storagePath]);
      await supabaseAdmin.rpc('release_photo_slot', { p_session_id: sessionId });
      return NextResponse.json({ error: 'Gagal menyimpan data foto' }, { status: 500 });
    }

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(GUEST_PHOTO_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);
      
    if (signedUrlError) {
      console.error('Error generating signed URL:', signedUrlError);
    }

    return NextResponse.json({
      id: photoRecord.id,
      storage_path: photoRecord.storage_path,
      status: photoRecord.status,
      signed_url: signedUrlData?.signedUrl || null,
      created_at: photoRecord.created_at
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
