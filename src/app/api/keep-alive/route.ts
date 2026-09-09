import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('rsvps')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase keep-alive error:', error);

      return NextResponse.json(
        {
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase database query successful',
      database: 'connected',
      rows: data?.length ?? 0,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Keep alive failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error
          ? error.message
          : 'Failed to connect to Supabase',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}