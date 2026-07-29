/**
 * Script: Compress & convert gallery photos to WebP
 * 
 * Downloads gallery photos from Supabase, compresses them to WebP format,
 * then re-uploads the optimized versions.
 * 
 * Usage: node scripts/optimize-gallery.mjs
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import https from 'https';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://phzbfeoxgwqfmulacpzn.supabase.co';

// Read anon key from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
if (!supabaseKey) throw new Error('Could not read SUPABASE_ANON_KEY from .env.local');

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET = 'wedding-assets';

// Current gallery file names (from assets.ts)
const galleryFileNames = [
  'foto-studio-1.jpg',
  'lamaran-1.jpg',
  'prewed-putih-1.jpg',
  'prewed-putih-2.jpg',
  'prewed-putih-3.jpg',
  'prewed-putih-4.jpg',
  'foto-studio-2.jpg',
  'lamaran-2.jpg',
  'prewed-merah-1.jpg',
  'prewed-merah-2.jpg',
  'prewed-merah-3.jpg',
  'prewed-merah-4.jpg'
];

// Temp directory for processing
const TEMP_DIR = './scripts/temp-gallery';

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const follow = (url) => {
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          follow(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
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

async function optimizeAndUpload(fileName) {
  const baseName = path.parse(fileName).name;
  const webpName = `${baseName}.webp`;
  const storagePath = `images/gallery/${fileName}`;
  const webpStoragePath = `images/gallery/${webpName}`;

  // Step 1: Download original
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storagePath}`;
  console.log(`\n📥 Downloading: ${fileName}...`);
  
  let buffer;
  try {
    buffer = await downloadImage(publicUrl);
  } catch (err) {
    console.error(`   ❌ Failed to download ${fileName}: ${err.message}`);
    return null;
  }
  
  const originalSize = (buffer.length / 1024 / 1024).toFixed(2);
  console.log(`   Original: ${originalSize} MB`);

  // Step 2: Compress with sharp → WebP
  console.log(`🔄 Compressing to WebP...`);
  const optimized = await sharp(buffer)
    .resize({ width: 2000, withoutEnlargement: true }) // Max 2000px wide
    .webp({ quality: 80 }) // WebP at quality 80
    .toBuffer();

  const newSize = (optimized.length / 1024 / 1024).toFixed(2);
  const savings = (((buffer.length - optimized.length) / buffer.length) * 100).toFixed(1);
  console.log(`   Compressed: ${newSize} MB (${savings}% smaller)`);

  // Step 3: Upload optimized version
  console.log(`📤 Uploading: ${webpName}...`);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(webpStoragePath, optimized, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (error) {
    console.error(`   ❌ Upload error: ${error.message}`);
    return null;
  }

  console.log(`   ✅ Done: ${webpName}`);
  return webpName;
}

async function main() {
  console.log('🚀 Gallery Photo Optimizer');
  console.log('='.repeat(50));
  console.log(`Processing ${galleryFileNames.length} photos...\n`);

  const newFileNames = [];
  let totalOriginal = 0;
  let totalCompressed = 0;

  for (const fileName of galleryFileNames) {
    const result = await optimizeAndUpload(fileName);
    if (result) {
      newFileNames.push(result);
    } else {
      // Keep original name if optimization failed
      newFileNames.push(fileName);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✨ Optimization complete!\n');
  console.log('📝 Update your src/lib/assets.ts galleryFileNames to:\n');
  console.log('const galleryFileNames = [');
  newFileNames.forEach((name, i) => {
    const comma = i < newFileNames.length - 1 ? ',' : '';
    console.log(`  '${name}'${comma}`);
  });
  console.log('];');
}

main().catch(console.error);
