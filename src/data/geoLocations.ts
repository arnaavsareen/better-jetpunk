// GeoGuesser location types and utilities

export interface GeoLocation {
    id: number;
    lat: number;
    lng: number;
    country?: string;
    city?: string;
}

// Curated list of fun and interesting locations for GeoGuesser
// Mix of urban cities, rural areas, and scenic locations from around the world
const CURATED_LOCATIONS: Omit<GeoLocation, 'id'>[] = [
    // NORTH AMERICA - Urban
    { lat: 40.7589, lng: -73.9851, country: 'USA', city: 'New York City' }, // Times Square
    { lat: 34.0522, lng: -118.2437, country: 'USA', city: 'Los Angeles' }, // Downtown LA
    { lat: 41.8781, lng: -87.6298, country: 'USA', city: 'Chicago' }, // The Loop
    { lat: 37.7749, lng: -122.4194, country: 'USA', city: 'San Francisco' }, // Market Street
    { lat: 25.7617, lng: -80.1918, country: 'USA', city: 'Miami' }, // South Beach
    { lat: 45.5017, lng: -73.5673, country: 'Canada', city: 'Montreal' }, // Old Montreal
    { lat: 43.6532, lng: -79.3832, country: 'Canada', city: 'Toronto' }, // Downtown
    { lat: 49.2827, lng: -123.1207, country: 'Canada', city: 'Vancouver' }, // Stanley Park
    { lat: 19.4326, lng: -99.1332, country: 'Mexico', city: 'Mexico City' }, // Centro Histórico
    { lat: 20.6597, lng: -103.3496, country: 'Mexico', city: 'Guadalajara' }, // Centro
    
    // NORTH AMERICA - Rural/Scenic
    { lat: 36.1699, lng: -115.1398, country: 'USA', city: 'Las Vegas' }, // Strip
    { lat: 40.0149, lng: -105.2705, country: 'USA', city: 'Boulder' }, // Mountain town
    { lat: 37.3382, lng: -121.8863, country: 'USA', city: 'San Jose' }, // Silicon Valley
    { lat: 33.4484, lng: -112.0740, country: 'USA', city: 'Phoenix' }, // Downtown
    { lat: 47.6062, lng: -122.3321, country: 'USA', city: 'Seattle' }, // Pike Place
    
    // EUROPE - Urban
    { lat: 51.5074, lng: -0.1278, country: 'UK', city: 'London' }, // Westminster
    { lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris' }, // Champs-Élysées
    { lat: 52.5200, lng: 13.4050, country: 'Germany', city: 'Berlin' }, // Mitte
    { lat: 41.9028, lng: 12.4964, country: 'Italy', city: 'Rome' }, // Centro Storico
    { lat: 40.4168, lng: -3.7038, country: 'Spain', city: 'Madrid' }, // Puerta del Sol
    { lat: 41.3851, lng: 2.1734, country: 'Spain', city: 'Barcelona' }, // Las Ramblas
    { lat: 52.3676, lng: 4.9041, country: 'Netherlands', city: 'Amsterdam' }, // Centrum
    { lat: 59.3293, lng: 18.0686, country: 'Sweden', city: 'Stockholm' }, // Gamla Stan
    { lat: 55.6761, lng: 12.5683, country: 'Denmark', city: 'Copenhagen' }, // Nyhavn
    { lat: 50.0755, lng: 14.4378, country: 'Czech Republic', city: 'Prague' }, // Old Town
    { lat: 48.2082, lng: 16.3738, country: 'Austria', city: 'Vienna' }, // Innere Stadt
    { lat: 45.4642, lng: 9.1900, country: 'Italy', city: 'Milan' }, // Duomo
    { lat: 50.8503, lng: 4.3517, country: 'Belgium', city: 'Brussels' }, // Grand Place
    { lat: 53.3498, lng: -6.2603, country: 'Ireland', city: 'Dublin' }, // Temple Bar
    { lat: 59.9343, lng: 30.3351, country: 'Russia', city: 'Saint Petersburg' }, // Nevsky Prospect
    
    // EUROPE - Rural/Scenic
    { lat: 47.3769, lng: 8.5417, country: 'Switzerland', city: 'Zurich' }, // Old Town
    { lat: 46.5197, lng: 6.6323, country: 'Switzerland', city: 'Lausanne' }, // Lake Geneva
    { lat: 60.1699, lng: 24.9384, country: 'Finland', city: 'Helsinki' }, // Senate Square
    { lat: 64.1466, lng: -21.9426, country: 'Iceland', city: 'Reykjavik' }, // Downtown
    { lat: 38.7223, lng: -9.1393, country: 'Portugal', city: 'Lisbon' }, // Alfama
    { lat: 41.0082, lng: 28.9784, country: 'Turkey', city: 'Istanbul' }, // Sultanahmet
    { lat: 40.8518, lng: 14.2681, country: 'Italy', city: 'Naples' }, // Historic center
    { lat: 45.0703, lng: 7.6869, country: 'Italy', city: 'Turin' }, // Piazza Castello
    { lat: 50.0647, lng: 19.9450, country: 'Poland', city: 'Krakow' }, // Old Town
    { lat: 47.4979, lng: 19.0402, country: 'Hungary', city: 'Budapest' }, // Castle Hill
    { lat: 44.4268, lng: 26.1025, country: 'Romania', city: 'Bucharest' }, // Old Town
    { lat: 59.4370, lng: 24.7536, country: 'Estonia', city: 'Tallinn' }, // Old Town
    { lat: 56.9496, lng: 24.1052, country: 'Latvia', city: 'Riga' }, // Old Town
    { lat: 54.6872, lng: 25.2797, country: 'Lithuania', city: 'Vilnius' }, // Old Town
    { lat: 43.8563, lng: 18.4131, country: 'Bosnia and Herzegovina', city: 'Sarajevo' }, // Baščaršija
    { lat: 42.6977, lng: 23.3219, country: 'Bulgaria', city: 'Sofia' }, // City center
    { lat: 37.9838, lng: 23.7275, country: 'Greece', city: 'Athens' }, // Acropolis area
    { lat: 40.6401, lng: 22.9444, country: 'Greece', city: 'Thessaloniki' }, // Waterfront
    
    // ASIA - Urban
    { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo' }, // Shibuya
    { lat: 34.6937, lng: 135.5023, country: 'Japan', city: 'Osaka' }, // Dotonbori
    { lat: 35.0116, lng: 135.7681, country: 'Japan', city: 'Kyoto' }, // Gion
    { lat: 37.5665, lng: 126.9780, country: 'South Korea', city: 'Seoul' }, // Myeongdong
    { lat: 22.3193, lng: 114.1694, country: 'Hong Kong', city: 'Hong Kong' }, // Central
    { lat: 1.3521, lng: 103.8198, country: 'Singapore', city: 'Singapore' }, // Marina Bay
    { lat: 25.0330, lng: 121.5654, country: 'Taiwan', city: 'Taipei' }, // Ximending
    { lat: 13.7563, lng: 100.5018, country: 'Thailand', city: 'Bangkok' }, // Sukhumvit
    { lat: 3.1390, lng: 101.6869, country: 'Malaysia', city: 'Kuala Lumpur' }, // KLCC
    { lat: -6.2088, lng: 106.8456, country: 'Indonesia', city: 'Jakarta' }, // Central Jakarta
    { lat: 19.0760, lng: 72.8777, country: 'India', city: 'Mumbai' }, // Colaba
    { lat: 28.6139, lng: 77.2090, country: 'India', city: 'New Delhi' }, // Connaught Place
    { lat: 12.9716, lng: 77.5946, country: 'India', city: 'Bangalore' }, // MG Road
    { lat: 31.2304, lng: 121.4737, country: 'China', city: 'Shanghai' }, // The Bund
    { lat: 39.9042, lng: 116.4074, country: 'China', city: 'Beijing' }, // Forbidden City area
    
    // ASIA - Rural/Scenic
    { lat: 35.6586, lng: 139.7454, country: 'Japan', city: 'Tokyo' }, // Harajuku
    { lat: 24.7136, lng: 46.6753, country: 'Saudi Arabia', city: 'Riyadh' }, // Al Olaya
    { lat: 25.2048, lng: 55.2708, country: 'UAE', city: 'Dubai' }, // Downtown
    { lat: 24.4539, lng: 54.3773, country: 'UAE', city: 'Abu Dhabi' }, // Corniche
    { lat: 10.8231, lng: 106.6297, country: 'Vietnam', city: 'Ho Chi Minh City' }, // District 1
    { lat: 21.0285, lng: 105.8542, country: 'Vietnam', city: 'Hanoi' }, // Old Quarter
    { lat: 14.5995, lng: 120.9842, country: 'Philippines', city: 'Manila' }, // Intramuros
    { lat: 10.3157, lng: 123.8854, country: 'Philippines', city: 'Cebu' }, // Colon Street
    { lat: 13.4125, lng: 103.8670, country: 'Cambodia', city: 'Siem Reap' }, // Angkor area
    { lat: 11.5564, lng: 104.9282, country: 'Cambodia', city: 'Phnom Penh' }, // Riverside
    { lat: 27.7172, lng: 85.3240, country: 'Nepal', city: 'Kathmandu' }, // Thamel
    { lat: 6.9271, lng: 79.8612, country: 'Sri Lanka', city: 'Colombo' }, // Fort
    { lat: 7.2906, lng: 80.6337, country: 'Sri Lanka', city: 'Kandy' }, // Temple area
    { lat: 23.6850, lng: 90.3563, country: 'Bangladesh', city: 'Dhaka' }, // Old Dhaka
    { lat: 24.8607, lng: 67.0011, country: 'Pakistan', city: 'Karachi' }, // Clifton
    { lat: 33.6844, lng: 73.0479, country: 'Pakistan', city: 'Islamabad' }, // Capital
    { lat: 1.3042, lng: 103.8318, country: 'Singapore', city: 'Singapore' }, // Orchard Road
    { lat: -8.6705, lng: 115.2126, country: 'Indonesia', city: 'Bali' }, // Ubud
    { lat: -6.2000, lng: 106.8167, country: 'Indonesia', city: 'Jakarta' }, // Menteng district
    
    // OCEANIA - Urban
    { lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney' }, // Circular Quay
    { lat: -37.8136, lng: 144.9631, country: 'Australia', city: 'Melbourne' }, // CBD
    { lat: -27.4698, lng: 153.0251, country: 'Australia', city: 'Brisbane' }, // South Bank
    { lat: -31.9505, lng: 115.8605, country: 'Australia', city: 'Perth' }, // CBD
    { lat: -34.9285, lng: 138.6007, country: 'Australia', city: 'Adelaide' }, // Rundle Mall
    { lat: -36.8485, lng: 174.7633, country: 'New Zealand', city: 'Auckland' }, // CBD
    { lat: -41.2865, lng: 174.7762, country: 'New Zealand', city: 'Wellington' }, // Lambton Quay
    
    // OCEANIA - Rural/Scenic
    { lat: -25.2744, lng: 133.7751, country: 'Australia', city: 'Uluru area' }, // Outback
    { lat: -43.5321, lng: 172.6362, country: 'New Zealand', city: 'Christchurch' }, // Cathedral Square
    { lat: -18.1416, lng: 178.4419, country: 'Fiji', city: 'Suva' }, // Capital
    { lat: -9.4281, lng: 147.1397, country: 'Papua New Guinea', city: 'Port Moresby' }, // Capital
    { lat: -13.8333, lng: -171.7667, country: 'Samoa', city: 'Apia' }, // Capital
    { lat: -17.7333, lng: 168.3167, country: 'Vanuatu', city: 'Port Vila' }, // Capital
    { lat: -21.1333, lng: -175.2000, country: 'Tonga', city: 'Nuku\'alofa' }, // Capital
    { lat: -8.5167, lng: 179.2167, country: 'Tuvalu', city: 'Funafuti' }, // Capital
    { lat: -16.5000, lng: -151.7500, country: 'French Polynesia', city: 'Papeete' }, // Tahiti
    { lat: -19.0522, lng: -169.9192, country: 'Niue', city: 'Alofi' }, // Capital
    { lat: -21.2075, lng: -159.7750, country: 'Cook Islands', city: 'Avarua' }, // Rarotonga
    { lat: -12.5000, lng: 130.8333, country: 'Australia', city: 'Darwin' }, // Northern Territory
    { lat: -42.8821, lng: 147.3272, country: 'Australia', city: 'Hobart' }, // Tasmania
    { lat: -45.8741, lng: 170.5036, country: 'New Zealand', city: 'Dunedin' }, // South Island
    { lat: -37.7870, lng: 175.2793, country: 'New Zealand', city: 'Hamilton' }, // Waikato
    
    // SOUTH AMERICA - Urban
    { lat: -23.5505, lng: -46.6333, country: 'Brazil', city: 'São Paulo' }, // Avenida Paulista
    { lat: -22.9068, lng: -43.1729, country: 'Brazil', city: 'Rio de Janeiro' }, // Copacabana
    { lat: -34.6037, lng: -58.3816, country: 'Argentina', city: 'Buenos Aires' }, // Microcentro
    { lat: -33.4489, lng: -70.6693, country: 'Chile', city: 'Santiago' }, // Centro
    { lat: -12.0464, lng: -77.0428, country: 'Peru', city: 'Lima' }, // Miraflores
    { lat: 4.7110, lng: -74.0721, country: 'Colombia', city: 'Bogotá' }, // La Candelaria
    { lat: -0.1807, lng: -78.4678, country: 'Ecuador', city: 'Quito' }, // Old Town
    
    // SOUTH AMERICA - Rural/Scenic
    { lat: -15.7975, lng: -47.8919, country: 'Brazil', city: 'Brasília' }, // Plano Piloto
    { lat: -25.2637, lng: -57.5759, country: 'Paraguay', city: 'Asunción' }, // Centro
    { lat: -8.0476, lng: -34.8770, country: 'Brazil', city: 'Recife' }, // Historic center
    { lat: -3.7172, lng: -38.5433, country: 'Brazil', city: 'Fortaleza' }, // Beira Mar
    { lat: -12.9714, lng: -38.5014, country: 'Brazil', city: 'Salvador' }, // Pelourinho
    { lat: -16.2904, lng: -48.9547, country: 'Brazil', city: 'Goiânia' }, // Central
    { lat: -25.4284, lng: -49.2733, country: 'Brazil', city: 'Curitiba' }, // Batel
    { lat: -10.9111, lng: -37.0717, country: 'Brazil', city: 'Aracaju' }, // Orla
    { lat: -13.1631, lng: -72.5450, country: 'Peru', city: 'Cusco' }, // Historic center
    { lat: -16.5000, lng: -68.1500, country: 'Bolivia', city: 'La Paz' }, // El Alto
    { lat: -34.9011, lng: -56.1645, country: 'Uruguay', city: 'Montevideo' }, // Ciudad Vieja
    { lat: 10.4806, lng: -66.9036, country: 'Venezuela', city: 'Caracas' }, // Chacao
    
    // AFRICA - Urban
    { lat: -33.9249, lng: 18.4241, country: 'South Africa', city: 'Cape Town' }, // V&A Waterfront
    { lat: -26.2041, lng: 28.0473, country: 'South Africa', city: 'Johannesburg' }, // Sandton
    { lat: -29.8587, lng: 31.0218, country: 'South Africa', city: 'Durban' }, // Golden Mile
    { lat: -25.7479, lng: 28.2293, country: 'South Africa', city: 'Pretoria' }, // Union Buildings
    { lat: 30.0444, lng: 31.2357, country: 'Egypt', city: 'Cairo' }, // Downtown
    { lat: 31.2001, lng: 29.9187, country: 'Egypt', city: 'Alexandria' }, // Corniche
    { lat: 31.7683, lng: 35.2137, country: 'Israel', city: 'Jerusalem' }, // Old City
    { lat: 32.0853, lng: 34.7818, country: 'Israel', city: 'Tel Aviv' }, // Rothschild Boulevard
    { lat: 6.5244, lng: 3.3792, country: 'Nigeria', city: 'Lagos' }, // Victoria Island
    { lat: 9.0765, lng: 7.3986, country: 'Nigeria', city: 'Abuja' }, // Capital
    { lat: 5.6037, lng: -0.1870, country: 'Ghana', city: 'Accra' }, // Osu
    { lat: 6.6885, lng: -1.6244, country: 'Ghana', city: 'Kumasi' }, // Central
    { lat: -6.7924, lng: 39.2083, country: 'Tanzania', city: 'Dar es Salaam' }, // CBD
    { lat: -3.3822, lng: 36.6822, country: 'Tanzania', city: 'Arusha' }, // Near Kilimanjaro
    { lat: -1.2921, lng: 36.8219, country: 'Kenya', city: 'Nairobi' }, // CBD
    { lat: -0.3031, lng: 36.0800, country: 'Kenya', city: 'Nakuru' }, // Lake Nakuru
    { lat: 33.5731, lng: -7.5898, country: 'Morocco', city: 'Casablanca' }, // Corniche
    { lat: 34.0209, lng: -6.8416, country: 'Morocco', city: 'Rabat' }, // Capital
    { lat: 31.6295, lng: -7.9811, country: 'Morocco', city: 'Marrakech' }, // Medina
    { lat: 35.7595, lng: -5.8330, country: 'Morocco', city: 'Tangier' }, // Port
    { lat: 14.7167, lng: -17.4677, country: 'Senegal', city: 'Dakar' }, // Plateau
    { lat: 9.1450, lng: 38.7667, country: 'Ethiopia', city: 'Addis Ababa' }, // Bole
    { lat: 0.3136, lng: 32.5811, country: 'Uganda', city: 'Kampala' }, // Central
    { lat: -15.3875, lng: 28.3228, country: 'Zambia', city: 'Lusaka' }, // CBD
    { lat: -17.8252, lng: 31.0335, country: 'Zimbabwe', city: 'Harare' }, // CBD
    { lat: -19.0154, lng: 29.1549, country: 'Zimbabwe', city: 'Bulawayo' }, // Central
    { lat: -24.6282, lng: 25.9231, country: 'Botswana', city: 'Gaborone' }, // CBD
    { lat: -22.5597, lng: 17.0832, country: 'Namibia', city: 'Windhoek' }, // Central
    { lat: -4.3276, lng: 15.3136, country: 'DR Congo', city: 'Kinshasa' }, // Gombe
    { lat: -4.4419, lng: 15.2663, country: 'Republic of the Congo', city: 'Brazzaville' }, // Central
    { lat: 36.8000, lng: 10.1833, country: 'Tunisia', city: 'Tunis' }, // Medina
    { lat: 36.7538, lng: 3.0588, country: 'Algeria', city: 'Algiers' }, // Casbah
    { lat: -1.9441, lng: 30.0619, country: 'Rwanda', city: 'Kigali' }, // CBD
    { lat: -18.9136, lng: 47.5361, country: 'Madagascar', city: 'Antananarivo' }, // Capital
    
    // AFRICA - Rural/Scenic
    { lat: -2.3272, lng: 29.3250, country: 'Rwanda', city: 'Butare' }, // University town
    { lat: -1.2833, lng: 36.8167, country: 'Kenya', city: 'Nairobi National Park area' }, // Wildlife
    { lat: -15.4167, lng: 28.2833, country: 'Zambia', city: 'Livingstone' }, // Victoria Falls area
    { lat: -24.6581, lng: 25.9087, country: 'Botswana', city: 'Maun' }, // Okavango Delta gateway
    { lat: -26.2676, lng: 27.8585, country: 'South Africa', city: 'Soweto' }, // Township
    { lat: -33.9348, lng: 18.8662, country: 'South Africa', city: 'Stellenbosch' }, // Wine region
];

// Get a random location from the curated list
function getRandomCuratedLocation(): GeoLocation {
    const location = CURATED_LOCATIONS[Math.floor(Math.random() * CURATED_LOCATIONS.length)];
    return {
        id: Date.now() + Math.random(),
        lat: location.lat,
        lng: location.lng,
        country: location.country,
        city: location.city,
    };
}

/**
 * Get a random location from the curated list of interesting places
 * All locations are pre-validated to be interesting and have good Street View coverage
 */
export async function getRandomLocation(): Promise<GeoLocation> {
    // Simply return a random location from our curated list
    // All locations are already interesting and validated
    return getRandomCuratedLocation();
}

/**
 * Synchronous version for backward compatibility
 * Returns a location from the curated list
 */
export function getRandomLocationSync(): GeoLocation {
    return getRandomCuratedLocation();
}

// Get multiple unique random locations from curated list
export async function getRandomLocations(count: number): Promise<GeoLocation[]> {
    const locations: GeoLocation[] = [];
    const usedIndices = new Set<number>();
    
    // Ensure we don't request more locations than we have
    const maxCount = Math.min(count, CURATED_LOCATIONS.length);
    
    while (locations.length < maxCount) {
        let index: number;
        do {
            index = Math.floor(Math.random() * CURATED_LOCATIONS.length);
        } while (usedIndices.has(index));
        
        usedIndices.add(index);
        const location = CURATED_LOCATIONS[index];
        locations.push({
            id: Date.now() + Math.random() + locations.length,
            lat: location.lat,
            lng: location.lng,
            country: location.country,
            city: location.city,
        });
    }
    
    return locations;
}

// Synchronous version for backward compatibility
export function getRandomLocationsSync(count: number): GeoLocation[] {
    const locations: GeoLocation[] = [];
    const usedIndices = new Set<number>();
    
    // Ensure we don't request more locations than we have
    const maxCount = Math.min(count, CURATED_LOCATIONS.length);
    
    while (locations.length < maxCount) {
        let index: number;
        do {
            index = Math.floor(Math.random() * CURATED_LOCATIONS.length);
        } while (usedIndices.has(index));
        
        usedIndices.add(index);
        const location = CURATED_LOCATIONS[index];
        locations.push({
            id: Date.now() + Math.random() + locations.length,
            lat: location.lat,
            lng: location.lng,
            country: location.country,
            city: location.city,
        });
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
