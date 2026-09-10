import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceRoleKey) {
  console.warn(
    '[supabase-admin] SUPABASE_SERVICE_ROLE_KEY is not set. ' +
    'Server-side operations requiring admin access will fail.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || 'dummy-key-for-build-time', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
