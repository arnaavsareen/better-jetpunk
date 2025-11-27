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

/**
 * Find a nearby location with clues (roads, cities, landmarks)
 * Uses reverse geocoding to find actual places instead of random fields
 */
async function findLocationWithClues(lat: number, lng: number): Promise<GeoLocation | null> {
    try {
        // Use reverse geocoding to find nearby roads/cities
        // This ensures we're near actual infrastructure with clues
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'BetterJetPunk/1.0'
                },
                signal: AbortSignal.timeout(2000) // 2 second timeout
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        
        // Check if we found a road or populated area
        if (data.address) {
            const hasRoad = data.address.road || data.address.pedestrian || data.address.path;
            const hasCity = data.address.city || data.address.town || data.address.village;
            const hasSuburb = data.address.suburb || data.address.neighbourhood;
            
            // If we're on a road or in a populated area, use this location
            if (hasRoad || hasCity || hasSuburb) {
                // Use the exact coordinates from the response if available
                const resultLat = parseFloat(data.lat) || lat;
                const resultLng = parseFloat(data.lon) || lng;
                
                return {
                    id: Date.now() + Math.random(),
                    lat: Math.round(resultLat * 10000) / 10000,
                    lng: Math.round(resultLng * 10000) / 10000,
                };
            }
        }
        
        // If no good location found, try searching nearby (within 1km)
        // Look for roads in the area
        const nearbyResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=road&lat=${lat}&lon=${lng}&radius=1000&limit=1`,
            {
                headers: {
                    'User-Agent': 'BetterJetPunk/1.0'
                },
                signal: AbortSignal.timeout(2000)
            }
        );
        
        if (nearbyResponse.ok) {
            const nearbyData = await nearbyResponse.json();
            if (nearbyData && nearbyData.length > 0) {
                const result = nearbyData[0];
                return {
                    id: Date.now() + Math.random(),
                    lat: Math.round(parseFloat(result.lat) * 10000) / 10000,
                    lng: Math.round(parseFloat(result.lon) * 10000) / 10000,
                };
            }
        }
        
        return null;
    } catch (error) {
        // On error, return null to fall back to original coordinates
        return null;
    }
}

// Simple ocean detection using known ocean coordinates
// This avoids API calls and rate limiting
function isLikelyOcean(lat: number, lng: number): boolean {
    // Major ocean regions (approximate boundaries)
    // Pacific Ocean
    if (lat > -60 && lat < 60 && lng > 100 && lng < -70) {
        // Check if it's actually in the Pacific (not near land)
        if (lat > 5 && lat < 50 && lng > 120 && lng < -120) {
            // Far from known land masses in Pacific
            if (!(lat > 20 && lat < 50 && lng > 120 && lng < 150) && // Japan
                !(lat > -10 && lat < 10 && lng > 100 && lng < 150) && // Indonesia/Philippines
                !(lat > -50 && lat < -10 && lng > 110 && lng < 180)) { // Australia/New Zealand
                return true;
            }
        }
    }
    
    // Atlantic Ocean (east of Americas, west of Europe/Africa)
    if (lat > -60 && lat < 70 && lng > -80 && lng < 20) {
        // Far from known land
        if (!(lat > 25 && lat < 50 && lng > -80 && lng < -50) && // North America east coast
            !(lat > 35 && lat < 70 && lng > -10 && lng < 40) && // Europe
            !(lat > -35 && lat < 35 && lng > -20 && lng < 50)) { // Africa
            // Check if it's in the middle of Atlantic
            if (lng > -60 && lng < 0 && lat > 10 && lat < 50) {
                return true;
            }
        }
    }
    
    // Indian Ocean
    if (lat > -60 && lat < 30 && lng > 20 && lng < 120) {
        // Far from known land
        if (!(lat > -35 && lat < 5 && lng > 20 && lng < 50) && // Africa east coast
            !(lat > 5 && lat < 35 && lng > 60 && lng < 100) && // India
            !(lat > -12 && lat < 6 && lng > 95 && lng < 141)) { // Indonesia
            // Middle of Indian Ocean
            if (lng > 50 && lng < 100 && lat > -40 && lat < 10) {
                return true;
            }
        }
    }
    
    // Arctic Ocean (very high latitude, away from known land)
    if (lat > 70 && lat < 90) {
        // Most of Arctic is ocean, but we want to avoid it anyway for Street View
        return true;
    }
    
    // Southern Ocean (very low latitude, away from known land)
    if (lat < -60) {
        return true;
    }
    
    return false;
}

/**
 * Simple validation - just check if it's obviously in an ocean
 * We skip API calls to avoid rate limiting - Street View API will handle availability
 */
async function isLocationOnLand(lat: number, lng: number): Promise<boolean> {
    // Quick check - if it's obviously in an ocean, reject it
    return !isLikelyOcean(lat, lng);
}

/**
 * Get a random location that is validated to be on land AND has clues
 * Tries to find locations near roads/cities instead of random fields
 * Uses reverse geocoding to find actual places with infrastructure
 */
export async function getRandomLocation(): Promise<GeoLocation> {
    const maxRetries = 3; // Reduced retries since we're doing more work per attempt
    let attempts = 0;

    while (attempts < maxRetries) {
        const baseLocation = generateRandomLocation();
        
        // Fast validation - check if it's not obviously in ocean
        const isValid = await isLocationOnLand(baseLocation.lat, baseLocation.lng);
        
        if (!isValid) {
            attempts++;
            continue;
        }
        
        // Try to find a nearby location with clues (roads, cities, etc.)
        // This ensures we're not in the middle of a field
        try {
            const locationWithClues = await findLocationWithClues(baseLocation.lat, baseLocation.lng);
            
            if (locationWithClues) {
                // Found a location with clues, use it
                return locationWithClues;
            }
            
            // If we couldn't find a location with clues, try the base location
            // Street View API will find the nearest panorama anyway
            // But add a small random offset to avoid exact field centers
            const offsetLat = baseLocation.lat + (Math.random() - 0.5) * 0.01; // ~1km offset
            const offsetLng = baseLocation.lng + (Math.random() - 0.5) * 0.01;
            
            return {
                id: Date.now() + Math.random(),
                lat: Math.round(offsetLat * 10000) / 10000,
                lng: Math.round(offsetLng * 10000) / 10000,
            };
        } catch (error) {
            // If finding clues fails, use base location with offset
            const offsetLat = baseLocation.lat + (Math.random() - 0.5) * 0.01;
            const offsetLng = baseLocation.lng + (Math.random() - 0.5) * 0.01;
            
            return {
                id: Date.now() + Math.random(),
                lat: Math.round(offsetLat * 10000) / 10000,
                lng: Math.round(offsetLng * 10000) / 10000,
            };
        }
    }

    // If all retries failed, return a generated location anyway
    // Street View will find the nearest panorama
    return generateRandomLocation();
}

/**
 * Synchronous version for backward compatibility
 * Returns a location without validation (used as fallback)
 */
export function getRandomLocationSync(): GeoLocation {
    return generateRandomLocation();
}

// Get multiple unique random locations (async version with validation)
export async function getRandomLocations(count: number): Promise<GeoLocation[]> {
    const locations: GeoLocation[] = [];
    for (let i = 0; i < count; i++) {
        const location = await getRandomLocation();
        locations.push(location);
        // Small delay to avoid rate limiting
        if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    return locations;
}

// Synchronous version for backward compatibility
export function getRandomLocationsSync(count: number): GeoLocation[] {
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
