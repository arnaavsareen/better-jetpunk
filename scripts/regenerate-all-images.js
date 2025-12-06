import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not found in .env file');
    process.exit(1);
}

// Import the generation script functions
const generateScript = path.join(__dirname, 'generate-phenotype-images.js');
console.log('To regenerate all images with consistent style, run:');
console.log('  node scripts/generate-phenotype-images.js');
console.log('\nOr delete existing images and regenerate:');
console.log('  rm public/images/phenotypes/*.jpg');
console.log('  node scripts/generate-phenotype-images.js');

