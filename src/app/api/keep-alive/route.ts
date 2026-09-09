import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('rsvp')
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
      database: 'active',
      rows_returned: data?.length ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Keep-alive error:', err);

    return NextResponse.json(
      {
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to ping Supabase',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}