import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Keep-alive endpoint to prevent Supabase from auto-pausing.
 * 
 * Set up a free cron service (e.g., cron-job.org) to call this
 * endpoint every 5 days:
 *   GET https://your-domain.com/api/keep-alive
 */
export async function GET() {
  try {
    // Simple query to keep Supabase active
    const { count, error } = await supabase
      .from('rsvp')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message, timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase is alive!',
      rsvp_count: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to ping Supabase', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
