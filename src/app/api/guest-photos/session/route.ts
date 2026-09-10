import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { GUEST_PHOTO_LIMIT, MAX_GUEST_NAME_LENGTH } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function getIpAddress(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return 'unknown';
}

function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT || 'wedding-photo-salt-2026';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guest_name } = body;

    if (!guest_name || typeof guest_name !== 'string') {
      return NextResponse.json(
        { error: 'Nama tamu tidak boleh kosong' },
        { status: 400 }
      );
    }

    let sanitizedName = guest_name.replace(/<[^>]*>?/gm, '').trim().replace(/\s+/g, ' ');

    if (!sanitizedName) {
      return NextResponse.json(
        { error: 'Nama tamu tidak valid' },
        { status: 400 }
      );
    }

    if (sanitizedName.length > MAX_GUEST_NAME_LENGTH) {
      sanitizedName = sanitizedName.substring(0, MAX_GUEST_NAME_LENGTH);
    }

    const ip = getIpAddress(req);
    const ipHash = hashIp(ip);

    // Rate limiting: check sessions from this IP in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { count, error: countError } = await supabaseAdmin
      .from('photo_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo);

    if (countError) {
      console.error('Error checking rate limit:', countError);
      return NextResponse.json(
        { error: 'Terjadi kesalahan pada server' },
        { status: 500 }
      );
    }

    if (count !== null && count >= 5) {
      return NextResponse.json(
        { error: 'Terlalu banyak sesi yang dibuat. Silakan coba lagi nanti.' },
        { status: 429 }
      );
    }

    const session_token = crypto.randomUUID();

    const { data, error } = await supabaseAdmin
      .from('photo_sessions')
      .insert({
        session_token,
        guest_name: sanitizedName,
        ip_hash: ipHash,
        photo_count: 0
      })
      .select('session_token, guest_name, photo_count')
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json(
        { error: 'Gagal membuat sesi foto' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session_token: data.session_token,
      guest_name: data.guest_name,
      photo_count: data.photo_count,
      photo_limit: GUEST_PHOTO_LIMIT
    });

  } catch (error) {
    console.error('Error in POST /api/guest-photos/session:', error);
    return NextResponse.json(
      { error: 'Permintaan tidak valid' },
      { status: 400 }
    );
  }
}
