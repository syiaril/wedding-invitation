import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji wajib diisi' }, { status: 400 });
    }

    const ip = getIpAddress(request);
    const ipHash = hashIp(ip);

    // Find if a session already exists for this IP
    let { data: session, error: sessionError } = await supabaseAdmin
      .from('photo_sessions')
      .select('id')
      .eq('ip_hash', ipHash)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError && sessionError.code !== 'PGRST116') {
      // PGRST116 means zero rows returned, which is fine
      console.error('Error fetching session:', sessionError);
    }

    if (!session) {
      // Create an anonymous session for this IP to allow reaction tracking
      const session_token = crypto.randomUUID();
      const { data: newSession, error: createError } = await supabaseAdmin
        .from('photo_sessions')
        .insert({
          session_token,
          guest_name: 'Tamu Anonim',
          ip_hash: ipHash,
          photo_count: 0
        })
        .select('id')
        .single();

      if (createError || !newSession) {
        console.error('Error creating anonymous session:', createError);
        return NextResponse.json({ error: 'Gagal memproses reaksi' }, { status: 500 });
      }
      session = newSession;
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
