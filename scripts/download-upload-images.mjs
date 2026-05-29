import { createClient } from '@supabase/supabase-js';
import https from 'https';

const supabaseUrl = 'https://phzbfeoxgwqfmulacpzn.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'wedding-assets';

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const follow = (url) => {
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          follow(res.headers.location);
          return;
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    };
    follow(url);
  });
}

async function uploadImage(url, storagePath) {
  console.log(`⏳ Downloading ${storagePath}...`);
  const buffer = await downloadImage(url);
  console.log(`   Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

  console.log(`⏳ Uploading to Supabase...`);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: true });

  if (error) {
    console.error(`❌ Error: ${error.message}`);
    return;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  console.log(`✅ Done: ${data.publicUrl}\n`);
}

async function main() {
  console.log('🚀 Downloading Unsplash images & uploading to Supabase...\n');

  await uploadImage(
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80',
    'images/hero.jpg'
  );

  await uploadImage(
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    'images/cover.jpg'
  );

  console.log('✨ All done!');
}

main().catch(console.error);
