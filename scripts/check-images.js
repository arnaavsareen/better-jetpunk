import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGE_DIR = path.join(__dirname, '../public/images/phenotypes');
const MANIFEST = path.join(IMAGE_DIR, 'manifest.json');

console.log('Checking phenotype images...\n');

if (!fs.existsSync(IMAGE_DIR)) {
    console.log('❌ Image directory does not exist:', IMAGE_DIR);
    console.log('   Run: node scripts/generate-phenotype-images.js');
    process.exit(1);
}

const files = fs.readdirSync(IMAGE_DIR).filter(f => f.endsWith('.jpg'));
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf-8')) : {};

console.log(`Images found: ${files.length}`);
console.log(`Manifest entries: ${Object.keys(manifest).length}\n`);

if (files.length === 0) {
    console.log('⚠️  No images found!');
    console.log('   To generate images:');
    console.log('   1. Add OPENAI_API_KEY to .env file');
    console.log('   2. Run: node scripts/generate-phenotype-images.js\n');
} else {
    console.log('✓ Images are available');
    console.log(`  Location: ${IMAGE_DIR}\n`);
}

