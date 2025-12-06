// Ethnic groups data for EthnoGuesser game
// Based on anthropological data and historical geographic distributions

export interface EthnicGroup {
    id: number;
    name: string;
    description: string;
    primaryRegion: string;
    lat: number;
    lng: number;
    region: string; // Continent/region
    imageUrl?: string; // Facial composite image URL
    imageKey?: string; // Key for local generated images
}

// Re-export image functions from phenotypeImages service
export { getPhenotypeImageUrl as getEthnicGroupImageUrl, getPhenotypeImageFallbackUrls as getEthnicGroupImageFallbackUrls } from '../services/phenotypeImages';

// Import fetched phenotype data
import phenotypeData from './ethnicGroups.json';

// Enhanced descriptions for phenotypes (from humanphenotypes.org and anthropological sources)
const phenotypeDescriptions: Record<string, string> = {
    'nordid': 'Light pigmentation, tall stature, dolichocephalic. Common in Scandinavia and Northern Germany. Associated with Nordic populations.',
    'mediterranid': 'Medium to dark pigmentation, gracile build, dolichocephalic. Common in Mediterranean region, North Africa, and parts of the Middle East.',
    'alpinid': 'Medium pigmentation, medium to short stature, brachycephalic. Common in Central Europe, particularly Alpine regions.',
    'eastnordid': 'Light pigmentation, tall stature, dolichocephalic. Common in Eastern Europe, particularly Baltic and Slavic regions.',
    'kelticnordid': 'Light pigmentation, tall stature, dolichocephalic. Common in Western Europe, particularly British Isles and France.',
    'sinid': 'Yellow pigmentation, medium stature, mesocephalic. Common in East Asia, particularly China, Japan, and Korea.',
    'sundadont': 'Medium to dark pigmentation, short to medium stature, brachycephalic. Common in Southeast Asia.',
    'indid': 'Medium pigmentation, gracile to medium build, dolichocephalic. Common across the Indian subcontinent.',
    'turanid': 'Mixed features, medium pigmentation, medium stature. Common in Central Asia and parts of Eastern Europe.',
    'armenid': 'Medium to dark pigmentation, medium stature, brachycephalic. Common in West Asia, particularly Anatolia and Levant.',
    'congoid': 'Dark pigmentation, tall stature, dolichocephalic. Common in West and Central Africa.',
    'aethiopid': 'Dark pigmentation, tall and gracile build, dolichocephalic. Common in Ethiopia, Somalia, and Horn of Africa.',
    'bantuid': 'Dark pigmentation, medium to tall stature, dolichocephalic. Common in Central, Eastern, and Southern Africa.',
    'berberid': 'Medium pigmentation, medium stature, dolichocephalic. Common in North Africa, particularly Maghreb region.',
    'amerindian': 'Medium to dark pigmentation, medium stature, mesocephalic. Common across the Americas.',
    'maya': 'Medium pigmentation, short to medium stature, brachycephalic. Common in Mesoamerica.',
    'andean': 'Medium to dark pigmentation, short stature, brachycephalic. Common in Andean regions of South America.',
    'polynesid': 'Medium to dark pigmentation, tall and robust build, mesocephalic. Common in Polynesia.',
    'melanesid': 'Dark pigmentation, medium to tall stature, dolichocephalic. Common in Melanesia.',
    'australid': 'Dark pigmentation, medium stature, dolichocephalic. Common in Australia.',
    'tungid': 'Yellow pigmentation, medium stature, brachycephalic. Common in Siberia and Russian Far East.',
    'eskimid': 'Medium pigmentation, short to medium stature, brachycephalic. Common in Arctic regions.',
    'dravidian': 'Dark pigmentation, gracile build, dolichocephalic. Common in South India.',
    'khoid': 'Light brown pigmentation, short stature, distinctive facial features. Common in Southern Africa.',
    'sudanid': 'Dark pigmentation, very tall stature, narrow build. Common in Sudanic regions and parts of West Africa.',
    'atlantid': 'Light to medium pigmentation, medium to tall stature, dolichocephalic. Common in Iberian Peninsula.',
    'brunn': 'Light pigmentation, medium stature, mesocephalic. Common in British Isles.',
    'borreby': 'Light pigmentation, medium to tall stature, brachycephalic. Common in Northern Europe.',
    'faelid': 'Light pigmentation, medium stature, brachycephalic. Common in Central Europe.',
    'dalofaelid': 'Light pigmentation, medium stature, brachycephalic. Common in Scandinavia.',
    'westbaltid': 'Light pigmentation, medium stature, brachycephalic. Common in Eastern Europe.',
    'eastbaltid': 'Light pigmentation, medium stature, brachycephalic. Common in Baltic region.',
    'lappid': 'Medium pigmentation, short stature, brachycephalic. Common in Lapland and Northern Scandinavia.',
    'uralid': 'Medium pigmentation, medium stature, mesocephalic. Common in Ural region.',
    'sibirid': 'Medium pigmentation, medium stature, brachycephalic. Common in Siberia.',
    'paleomongolid': 'Yellow pigmentation, medium stature, brachycephalic. Common in Central Asia.',
    'neomongolid': 'Yellow pigmentation, medium stature, brachycephalic. Common in Mongolia and surrounding regions.',
    'sakhalid': 'Yellow pigmentation, medium stature, brachycephalic. Common in Sakhalin and Kuril Islands.'
};

// List of imageKeys that have both male and female images available
const availableImageKeys = new Set([
    'nordid',
    'mediterranid',
    'alpinid',
    'eastnordid',
    'kelticnordid',
    'sinid',
    'sundadont',
    'indid',
    'turanid',
    'armenid',
    'congoid',
    'aethiopid',
    'bantuid',
    'amerindian',
    'maya',
    'andean',
    'polynesid',
    'melanesid',
    'australid',
    'tungid',
    'eskimid',
    'dravidian',
    'khoid',
    'sudanid',
    'atlantid',
    'brunn',
    'borreby',
    'faelid',
    'dalofaelid',
    'westbaltid'
]);

// Major ethnic groups with their historical geographic centers
// Using data fetched from humanphenotypes.org with enhanced descriptions
// Filter to only include groups that have both male and female images
export const ethnicGroups: EthnicGroup[] = (phenotypeData as any[])
    .filter((p: any) => availableImageKeys.has(p.imageKey))
    .map((p: any) => ({
        id: p.id,
        name: p.name,
        description: phenotypeDescriptions[p.imageKey] || p.description,
        primaryRegion: p.primaryRegion,
        lat: p.lat,
        lng: p.lng,
        region: p.region,
        imageKey: p.imageKey
    }));

// Get a random ethnic group
export function getRandomEthnicGroup(): EthnicGroup {
    const randomIndex = Math.floor(Math.random() * ethnicGroups.length);
    return ethnicGroups[randomIndex];
}

// Calculate distance between two points (Haversine formula)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Calculate score based on distance (max 5000 points)
export function calculateScore(distance: number): number {
    if (distance < 50) return 5000;
    if (distance < 100) return 4500;
    if (distance < 200) return 4000;
    if (distance < 500) return 3500;
    if (distance < 1000) return 3000;
    if (distance < 2000) return 2500;
    if (distance < 3000) return 2000;
    if (distance < 5000) return 1500;
    if (distance < 7500) return 1000;
    if (distance < 10000) return 500;
    return Math.max(0, 500 - Math.floor(distance / 100));
}

// Get daily set of 10 ethnic groups (based on date)
export function getDailyEthnicGroups(): EthnicGroup[] {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Use day of year as seed for consistent daily sets
    const seed = dayOfYear;
    const selected: EthnicGroup[] = [];
    const used = new Set<number>();
    
    // Simple seeded random function
    let seedValue = seed;
    function seededRandom() {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
    }
    
    while (selected.length < 10 && selected.length < ethnicGroups.length) {
        const index = Math.floor(seededRandom() * ethnicGroups.length);
        if (!used.has(index)) {
            used.add(index);
            selected.push(ethnicGroups[index]);
        }
    }
    
    return selected;
}

