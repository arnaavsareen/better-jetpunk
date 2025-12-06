import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// List of basic phenotype keys from humanphenotypes.org
const PHENOTYPE_KEYS = [
    'nordid', 'mediterranid', 'alpinid', 'eastnordid', 'kelticnordid',
    'sinid', 'sundadont', 'indid', 'turanid', 'armenid',
    'congoid', 'aethiopid', 'bantuid', 'berberid', 'amerindian',
    'maya', 'andean', 'polynesid', 'melanesid', 'australid',
    'tungid', 'eskimid', 'dravidian', 'khoid', 'sudanid',
    'atlantid', 'brunn', 'borreby', 'faelid', 'dalofaelid',
    'westbaltid', 'eastbaltid', 'lappid', 'uralid', 'sibirid',
    'paleomongolid', 'neomongolid', 'sakhalid'
];

// Map phenotype keys to readable names and locations
const PHENOTYPE_DATA = {
    'nordid': { name: 'Nordid', region: 'Europe', lat: 60.4720, lng: 8.4689, primaryRegion: 'Scandinavia' },
    'mediterranid': { name: 'Mediterranid', region: 'Europe', lat: 38.7223, lng: 13.3613, primaryRegion: 'Mediterranean Basin' },
    'alpinid': { name: 'Alpinid', region: 'Europe', lat: 47.3769, lng: 8.5417, primaryRegion: 'Central Europe' },
    'eastnordid': { name: 'East Nordid', region: 'Europe', lat: 55.7558, lng: 37.6173, primaryRegion: 'Eastern Europe' },
    'kelticnordid': { name: 'Keltic Nordid', region: 'Europe', lat: 53.3498, lng: -6.2603, primaryRegion: 'Western Europe' },
    'sinid': { name: 'Sinid', region: 'Asia', lat: 35.6762, lng: 139.6503, primaryRegion: 'East Asia' },
    'sundadont': { name: 'Sundadont', region: 'Asia', lat: 13.7563, lng: 100.5018, primaryRegion: 'Southeast Asia' },
    'indid': { name: 'Indid', region: 'Asia', lat: 28.6139, lng: 77.2090, primaryRegion: 'South Asia' },
    'turanid': { name: 'Turanid', region: 'Asia', lat: 43.2220, lng: 76.8512, primaryRegion: 'Central Asia' },
    'armenid': { name: 'Armenid', region: 'Asia', lat: 33.8938, lng: 35.5018, primaryRegion: 'West Asia' },
    'congoid': { name: 'Congoid', region: 'Africa', lat: 6.5244, lng: 3.3792, primaryRegion: 'West Africa' },
    'aethiopid': { name: 'Aethiopid', region: 'Africa', lat: 9.1450, lng: 38.7616, primaryRegion: 'East Africa' },
    'bantuid': { name: 'Bantuid', region: 'Africa', lat: -4.0383, lng: 21.7587, primaryRegion: 'Central/Southern Africa' },
    'berberid': { name: 'Berberid', region: 'Africa', lat: 31.6295, lng: -7.9811, primaryRegion: 'North Africa' },
    'amerindian': { name: 'Amerindian', region: 'Americas', lat: 19.4326, lng: -99.1332, primaryRegion: 'Americas' },
    'maya': { name: 'Maya', region: 'Americas', lat: 20.6597, lng: -103.3496, primaryRegion: 'Mesoamerica' },
    'andean': { name: 'Andean', region: 'Americas', lat: -12.0464, lng: -77.0428, primaryRegion: 'Andes' },
    'polynesid': { name: 'Polynesid', region: 'Oceania', lat: -21.1786, lng: -175.1982, primaryRegion: 'Polynesia' },
    'melanesid': { name: 'Melanesid', region: 'Oceania', lat: -9.4438, lng: 147.1803, primaryRegion: 'Melanesia' },
    'australid': { name: 'Australid', region: 'Oceania', lat: -25.2744, lng: 133.7751, primaryRegion: 'Australia' },
    'tungid': { name: 'Tungid', region: 'Asia', lat: 64.8436, lng: 177.4833, primaryRegion: 'Siberia' },
    'eskimid': { name: 'Eskimid', region: 'Americas', lat: 64.8378, lng: -147.7164, primaryRegion: 'Arctic' },
    'dravidian': { name: 'Dravidian', region: 'Asia', lat: 13.0827, lng: 80.2707, primaryRegion: 'South India' },
    'khoid': { name: 'Khoid', region: 'Africa', lat: -22.9576, lng: 18.4904, primaryRegion: 'Southern Africa' },
    'sudanid': { name: 'Sudanid', region: 'Africa', lat: 15.5007, lng: 32.5599, primaryRegion: 'Sudan' },
    'atlantid': { name: 'Atlantid', region: 'Europe', lat: 40.4168, lng: -3.7038, primaryRegion: 'Iberian Peninsula' },
    'brunn': { name: 'Brunn', region: 'Europe', lat: 55.3781, lng: -3.4360, primaryRegion: 'British Isles' },
    'borreby': { name: 'Borreby', region: 'Europe', lat: 55.6761, lng: 12.5683, primaryRegion: 'Northern Europe' },
    'faelid': { name: 'Faelid', region: 'Europe', lat: 52.5200, lng: 13.4050, primaryRegion: 'Central Europe' },
    'dalofaelid': { name: 'Dalofaelid', region: 'Europe', lat: 59.3293, lng: 18.0686, primaryRegion: 'Scandinavia' },
    'westbaltid': { name: 'West Baltid', region: 'Europe', lat: 52.2297, lng: 21.0122, primaryRegion: 'Eastern Europe' },
    'eastbaltid': { name: 'East Baltid', region: 'Europe', lat: 54.6872, lng: 25.2797, primaryRegion: 'Baltic' },
    'lappid': { name: 'Lappid', region: 'Europe', lat: 68.2589, lng: 27.5385, primaryRegion: 'Lapland' },
    'uralid': { name: 'Uralid', region: 'Europe', lat: 59.9343, lng: 30.3351, primaryRegion: 'Ural Region' },
    'sibirid': { name: 'Sibirid', region: 'Asia', lat: 55.7558, lng: 37.6173, primaryRegion: 'Siberia' },
    'paleomongolid': { name: 'Paleomongolid', region: 'Asia', lat: 47.8864, lng: 106.9057, primaryRegion: 'Central Asia' },
    'neomongolid': { name: 'Neomongolid', region: 'Asia', lat: 47.8864, lng: 106.9057, primaryRegion: 'Mongolia' },
    'sakhalid': { name: 'Sakhalid', region: 'Asia', lat: 46.9541, lng: 142.7360, primaryRegion: 'Sakhalin' }
};

async function fetchPhenotypeDescription(key) {
    try {
        const response = await fetch(`https://humanphenotypes.org/${key}`);
        const html = await response.text();
        
        // Extract description from HTML (basic extraction)
        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        if (descMatch) {
            return descMatch[1];
        }
        
        // Fallback: try to find description in content
        const contentMatch = html.match(/<p[^>]*>([^<]{50,300})<\/p>/i);
        if (contentMatch) {
            return contentMatch[1].trim();
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching ${key}:`, error.message);
        return null;
    }
}

async function fetchAllPhenotypes() {
    console.log('Fetching phenotype data from humanphenotypes.org...');
    
    const phenotypes = [];
    
    for (let i = 0; i < PHENOTYPE_KEYS.length; i++) {
        const key = PHENOTYPE_KEYS[i];
        const data = PHENOTYPE_DATA[key];
        
        if (!data) {
            console.warn(`No data found for ${key}, skipping...`);
            continue;
        }
        
        console.log(`Fetching ${key}...`);
        const description = await fetchPhenotypeDescription(key) || 
            `Anthropological type from ${data.primaryRegion}. Part of the ${data.region} region.`;
        
        phenotypes.push({
            id: i + 1,
            name: data.name,
            description: description,
            primaryRegion: data.primaryRegion,
            lat: data.lat,
            lng: data.lng,
            region: data.region,
            imageKey: key
        });
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\nFetched ${phenotypes.length} phenotypes.`);
    
    const outputPath = path.join(__dirname, '../src/data/ethnicGroups.json');
    fs.writeFileSync(outputPath, JSON.stringify(phenotypes, null, 2));
    console.log(`Saved to ${outputPath}`);
    
    return phenotypes;
}

fetchAllPhenotypes().catch(console.error);

