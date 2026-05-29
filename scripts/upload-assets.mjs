import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://phzbfeoxgwqfmulacpzn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Set SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY env variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'wedding-assets';

async function uploadFile(localPath, storagePath, contentType) {
  const fileBuffer = fs.readFileSync(localPath);
  
  console.log(`⏳ Uploading ${storagePath}...`);
  
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`❌ Error uploading ${storagePath}:`, error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  console.log(`✅ Uploaded: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

async function createPlaceholders() {
  // Create placeholder text files to establish folder structure
  const folders = [
    'images/hero.txt',
    'images/cover.txt',
    'images/couple.txt',
    'images/gallery/1.txt',
    'images/gallery/2.txt',
    'images/gallery/3.txt',
    'images/gallery/4.txt',
    'images/gallery/5.txt',
    'images/gallery/6.txt',
    'images/gallery/7.txt',
    'images/gallery/8.txt',
  ];

  for (const folder of folders) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(folder, Buffer.from('placeholder - replace with actual image'), {
        contentType: 'text/plain',
        upsert: true,
      });
    if (!error) {
      console.log(`📁 Created placeholder: ${folder}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting asset upload to Supabase Storage...\n');

  // Upload background music
  const musicPath = path.resolve('public/music/background.mp3');
  if (fs.existsSync(musicPath)) {
    await uploadFile(musicPath, 'music/background.mp3', 'audio/mpeg');
  } else {
    console.log('⚠️  background.mp3 not found, skipping...');
  }

  console.log('\n📸 Creating image folder structure...');
  await createPlaceholders();

  console.log('\n✨ Done! Your Supabase Storage bucket is ready.');
  console.log('\n📋 Image Upload Guide:');
  console.log('   Upload your images to the "wedding-assets" bucket in Supabase Dashboard:');
  console.log('   - images/hero.jpg       → Hero section background');
  console.log('   - images/cover.jpg      → Door/Cover & Closing background');
  console.log('   - images/couple.jpg     → Couple photo (Opening section)');
  console.log('   - images/gallery/1.jpg  → Gallery photo 1');
  console.log('   - images/gallery/2.jpg  → Gallery photo 2');
  console.log('   ... and so on up to gallery/8.jpg');
}

main().catch(console.error);
