// GeoGuesser location types and utilities

export interface GeoLocation {
    id: number;
    lat: number;
    lng: number;
    country?: string;
    city?: string;
}

// Regions with good Street View coverage (weighted for random generation)
const COVERAGE_REGIONS = [
    // North America (good coverage)
    { minLat: 25, maxLat: 49, minLng: -125, maxLng: -70, weight: 20 },
    // Europe (excellent coverage)
    { minLat: 36, maxLat: 70, minLng: -10, maxLng: 40, weight: 25 },
    // Japan (excellent coverage)
    { minLat: 31, maxLat: 45, minLng: 129, maxLng: 146, weight: 10 },
    // South Korea (good coverage)
    { minLat: 34, maxLat: 38, minLng: 126, maxLng: 130, weight: 5 },
    // Australia (good coverage)
    { minLat: -44, maxLat: -10, minLng: 113, maxLng: 154, weight: 10 },
    // New Zealand (good coverage)
    { minLat: -47, maxLat: -34, minLng: 166, maxLng: 178, weight: 5 },
    // Brazil (decent coverage)
    { minLat: -33, maxLat: 5, minLng: -74, maxLng: -35, weight: 8 },
    // Argentina/Chile (decent coverage)
    { minLat: -55, maxLat: -22, minLng: -76, maxLng: -53, weight: 5 },
    // South Africa (decent coverage)
    { minLat: -35, maxLat: -22, minLng: 16, maxLng: 33, weight: 4 },
    // Thailand (good coverage)
    { minLat: 5, maxLat: 21, minLng: 97, maxLng: 106, weight: 4 },
    // Indonesia (partial coverage)
    { minLat: -11, maxLat: 6, minLng: 95, maxLng: 141, weight: 4 },
    // Russia (partial coverage - mainly cities)
    { minLat: 43, maxLat: 70, minLng: 27, maxLng: 180, weight: 5 },
    // Mexico (decent coverage)
    { minLat: 14, maxLat: 33, minLng: -118, maxLng: -86, weight: 5 },
    // Taiwan (excellent coverage)
    { minLat: 21, maxLat: 26, minLng: 119, maxLng: 122, weight: 3 },
    // Hong Kong/Singapore area
    { minLat: 1, maxLat: 23, minLng: 103, maxLng: 115, weight: 3 },
    // India (growing coverage)
    { minLat: 8, maxLat: 35, minLng: 68, maxLng: 97, weight: 4 },
    // Middle East (UAE, Israel, Turkey)
    { minLat: 24, maxLat: 42, minLng: 26, maxLng: 56, weight: 4 },
];

// Calculate total weight
const totalWeight = COVERAGE_REGIONS.reduce((sum, r) => sum + r.weight, 0);

// Generate a random location from regions with Street View coverage
function generateRandomLocation(): GeoLocation {
    // Pick a random region based on weight
    let random = Math.random() * totalWeight;
    let selectedRegion = COVERAGE_REGIONS[0];
    
    for (const region of COVERAGE_REGIONS) {
        random -= region.weight;
        if (random <= 0) {
            selectedRegion = region;
            break;
        }
    }

    // Generate random coordinates within the selected region
    const lat = selectedRegion.minLat + Math.random() * (selectedRegion.maxLat - selectedRegion.minLat);
    const lng = selectedRegion.minLng + Math.random() * (selectedRegion.maxLng - selectedRegion.minLng);

    return {
        id: Date.now() + Math.random(),
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
    };
}

// Get a random location
export function getRandomLocation(): GeoLocation {
    return generateRandomLocation();
}

// Get multiple unique random locations
export function getRandomLocations(count: number): GeoLocation[] {
    const locations: GeoLocation[] = [];
    for (let i = 0; i < count; i++) {
        locations.push(generateRandomLocation());
    }
    return locations;
}

// Calculate distance between two points using Haversine formula (in km)
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in km
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
export function calculateScore(distanceKm: number): number {
    if (distanceKm < 0.01) return 5000; // Within 10 meters
    if (distanceKm < 0.1) return 4900;  // Within 100 meters
    // Exponential decay - closer = more points
    const score = Math.round(5000 * Math.exp(-distanceKm / 2000));
    return Math.max(0, Math.min(5000, score));
}
