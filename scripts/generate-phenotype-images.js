import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not found in .env file');
    process.exit(1);
}

// Model configuration
// Options: 'dall-e-3' (recommended) or 'dall-e-2'
const MODEL = 'dall-e-3';

// Quality options for DALL-E 3:
// - 'standard' (default): Good balance of quality and cost (~$0.04/image)
// - 'hd': Higher quality, better for detailed portraits (~$0.08/image)
// For scientific facial composites, 'hd' is recommended for best consistency
const QUALITY = process.env.IMAGE_QUALITY || 'hd'; // 'standard' or 'hd'

// Style options for DALL-E 3:
// - 'natural': More realistic, consistent (recommended for scientific style)
// - 'vivid': More artistic, varied
const STYLE = 'natural';

// Load phenotype data
const phenotypeData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../src/data/ethnicGroups.json'), 'utf-8')
);

// Enhanced descriptions for better prompts
const phenotypeDescriptions = {
    'nordid': 'Light pigmentation, tall stature, dolichocephalic head shape, fair features',
    'mediterranid': 'Medium to dark pigmentation, gracile build, dolichocephalic, Mediterranean features',
    'alpinid': 'Medium pigmentation, medium to short stature, brachycephalic, Central European features',
    'eastnordid': 'Light pigmentation, tall stature, dolichocephalic, Eastern European features',
    'kelticnordid': 'Light pigmentation, tall stature, dolichocephalic, Western European features',
    'sinid': 'Yellow pigmentation, medium stature, mesocephalic, East Asian features',
    'sundadont': 'Medium to dark pigmentation, short to medium stature, brachycephalic, Southeast Asian features',
    'indid': 'Medium pigmentation, gracile to medium build, dolichocephalic, South Asian features',
    'turanid': 'Mixed features, medium pigmentation, medium stature, Central Asian features',
    'armenid': 'Medium to dark pigmentation, medium stature, brachycephalic, West Asian features',
    'congoid': 'Dark pigmentation, tall stature, dolichocephalic, West African features',
    'aethiopid': 'Dark pigmentation, tall and gracile build, dolichocephalic, East African features',
    'bantuid': 'Dark pigmentation, medium to tall stature, dolichocephalic, Central/Southern African features',
    'berberid': 'Medium pigmentation, medium stature, dolichocephalic, North African features',
    'amerindian': 'Medium to dark pigmentation, medium stature, mesocephalic, Native American features',
    'maya': 'Medium pigmentation, short to medium stature, brachycephalic, Mesoamerican features',
    'andean': 'Medium to dark pigmentation, short stature, brachycephalic, Andean features',
    'polynesid': 'Medium to dark pigmentation, tall and robust build, mesocephalic, Polynesian features',
    'melanesid': 'Dark pigmentation, medium to tall stature, dolichocephalic, Melanesian features',
    'australid': 'Dark pigmentation, medium stature, dolichocephalic, Australian Aboriginal features',
    'tungid': 'Yellow pigmentation, medium stature, brachycephalic, Siberian features',
    'eskimid': 'Medium pigmentation, short to medium stature, brachycephalic, Arctic features',
    'dravidian': 'Dark pigmentation, gracile build, dolichocephalic, South Indian features',
    'khoid': 'Light brown pigmentation, short stature, distinctive facial features, Khoisan features',
    'sudanid': 'Dark pigmentation, very tall stature, narrow build, Sudanic features',
    'atlantid': 'Light to medium pigmentation, medium to tall stature, dolichocephalic, Iberian features',
    'brunn': 'Light pigmentation, medium stature, mesocephalic, British Isles features',
    'borreby': 'Light pigmentation, medium to tall stature, brachycephalic, Northern European features',
    'faelid': 'Light pigmentation, medium stature, brachycephalic, Central European features',
    'dalofaelid': 'Light pigmentation, medium stature, brachycephalic, Scandinavian features',
    'westbaltid': 'Light pigmentation, medium stature, brachycephalic, Eastern European features',
    'eastbaltid': 'Light pigmentation, medium stature, brachycephalic, Baltic features',
    'lappid': 'Medium pigmentation, short stature, brachycephalic, Lapland features',
    'uralid': 'Medium pigmentation, medium stature, mesocephalic, Ural features',
    'sibirid': 'Medium pigmentation, medium stature, brachycephalic, Siberian features',
    'paleomongolid': 'Yellow pigmentation, medium stature, brachycephalic, Central Asian features',
    'neomongolid': 'Yellow pigmentation, medium stature, brachycephalic, Mongolian features',
    'sakhalid': 'Yellow pigmentation, medium stature, brachycephalic, Sakhalin features'
};

// Image cache directory
const IMAGE_CACHE_DIR = path.join(__dirname, '../public/images/phenotypes');
const CACHE_MANIFEST = path.join(IMAGE_CACHE_DIR, 'manifest.json');

// Ensure cache directory exists
if (!fs.existsSync(IMAGE_CACHE_DIR)) {
    fs.mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
}

// Load existing manifest
let manifest = {};
if (fs.existsSync(CACHE_MANIFEST)) {
    try {
        manifest = JSON.parse(fs.readFileSync(CACHE_MANIFEST, 'utf-8'));
    } catch (e) {
        manifest = {};
    }
}

// Prompt template for facial composite generation (matching humanphenotypes.org style exactly)
function createPrompt(phenotype, gender) {
    const genderText = gender === 'male' ? 'male' : 'female';
    const desc = phenotypeDescriptions[phenotype.imageKey] || phenotype.description;
    
    return `Anthropological facial composite portrait of a ${genderText} ${phenotype.name} phenotype. Blurred and averaged facial features, neutral expression, front-facing portrait, symmetrical face, light blurred grey background, professional scientific style exactly like humanphenotypes.org. Soft focus, composite appearance showing average characteristics. Physical traits: ${desc}. No text, labels, or watermarks.`;
}

async function generateImage(prompt, phenotypeKey, gender, forceRegenerate = false) {
    const imageKey = `${phenotypeKey}${gender === 'male' ? 'm' : 'f'}`;
    const imagePath = path.join(IMAGE_CACHE_DIR, `${imageKey}.jpg`);
    
    // Check if already cached (unless forcing regeneration)
    if (!forceRegenerate && fs.existsSync(imagePath) && manifest[imageKey]) {
        console.log(`✓ ${imageKey} already cached`);
        return manifest[imageKey];
    }

    console.log(`Generating ${imageKey}...`);

    try {
        const requestBody = {
            model: MODEL,
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'url',
            style: STYLE
        };

        // Add quality only for DALL-E 3
        if (MODEL === 'dall-e-3') {
            requestBody.quality = QUALITY;
        }

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        const imageUrl = data.data[0].url;

        // Download and save image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to download image: ${imageResponse.statusText}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        fs.writeFileSync(imagePath, Buffer.from(imageBuffer));

        // Update manifest
        manifest[imageKey] = `/images/phenotypes/${imageKey}.jpg`;
        fs.writeFileSync(CACHE_MANIFEST, JSON.stringify(manifest, null, 2));

        console.log(`✓ Generated and saved ${imageKey}`);
        
        // Rate limiting - wait 1 second between requests to avoid hitting limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return manifest[imageKey];
    } catch (error) {
        console.error(`✗ Error generating ${imageKey}:`, error.message);
        return null;
    }
}

async function generateAllImages(forceRegenerate = false) {
    console.log('Starting image generation for all phenotypes...\n');
    console.log(`Model: ${MODEL}`);
    console.log(`Quality: ${QUALITY}`);
    console.log(`Style: ${STYLE}`);
    console.log(`Total phenotypes: ${phenotypeData.length}`);
    console.log(`Images needed: ${phenotypeData.length * 2} (male + female)`);
    if (forceRegenerate) {
        console.log('⚠️  FORCE REGENERATE MODE: All images will be regenerated\n');
    } else {
        console.log('ℹ️  Existing images will be skipped\n');
    }

    let generated = 0;
    let skipped = 0;
    let errors = 0;

    for (const phenotype of phenotypeData) {
        if (!phenotype.imageKey) {
            console.warn(`⚠ Skipping ${phenotype.name} - no imageKey`);
            continue;
        }

        // Generate male image
        const malePrompt = createPrompt(phenotype, 'male');
        const maleResult = await generateImage(malePrompt, phenotype.imageKey, 'male', forceRegenerate);
        if (maleResult) {
            generated++;
        } else if (!forceRegenerate && manifest[`${phenotype.imageKey}m`]) {
            skipped++;
        } else {
            errors++;
        }

        // Generate female image
        const femalePrompt = createPrompt(phenotype, 'female');
        const femaleResult = await generateImage(femalePrompt, phenotype.imageKey, 'female', forceRegenerate);
        if (femaleResult) {
            generated++;
        } else if (!forceRegenerate && manifest[`${phenotype.imageKey}f`]) {
            skipped++;
        } else {
            errors++;
        }
    }

    console.log('\n=== Generation Complete ===');
    console.log(`Generated: ${generated}`);
    console.log(`Skipped (cached): ${skipped}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total: ${generated + skipped + errors}`);
}

// Check for force regenerate flag
const forceRegenerate = process.argv.includes('--force') || process.argv.includes('-f');
generateAllImages(forceRegenerate).catch(console.error);

