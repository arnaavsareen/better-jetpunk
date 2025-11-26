/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + 1   // substitution
                );
            }
        }
    }

    return matrix[len1][len2];
}

/**
 * Normalize string for comparison (remove accents, special chars, etc.)
 */
function normalizeString(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s]/g, '')     // Remove special characters
        .replace(/\s+/g, ' ')            // Normalize whitespace
        .trim();
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
function similarityScore(str1: string, str2: string): number {
    const normalized1 = normalizeString(str1);
    const normalized2 = normalizeString(str2);

    // Exact match
    if (normalized1 === normalized2) return 1.0;

    // Check if one contains the other (partial match)
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        const longer = normalized1.length > normalized2.length ? normalized1 : normalized2;
        const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1;
        return shorter.length / longer.length;
    }

    // Calculate Levenshtein distance
    const distance = levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    
    if (maxLength === 0) return 1.0;
    
    // Convert distance to similarity score
    const similarity = 1 - (distance / maxLength);
    
    // Boost score for shorter strings (more forgiving for typos in short names)
    const lengthBoost = normalized1.length < 6 || normalized2.length < 6 ? 0.1 : 0;
    
    return Math.min(1.0, similarity + lengthBoost);
}

/**
 * Check if input matches a country name with fuzzy matching
 * Returns a match score (0-1) or null if no good match
 */
export function fuzzyMatchCountry(
    input: string,
    countryName: string,
    acceptedNames: string[]
): number | null {
    const normalizedInput = normalizeString(input);
    const normalizedCountry = normalizeString(countryName);

    // Check exact matches first (including accepted names)
    if (normalizedInput === normalizedCountry) return 1.0;
    
    for (const acceptedName of acceptedNames) {
        if (normalizedInput === normalizeString(acceptedName)) return 1.0;
    }

    // Check if input is a substring of country name or vice versa
    if (normalizedCountry.includes(normalizedInput) || normalizedInput.includes(normalizedCountry)) {
        const longer = normalizedCountry.length > normalizedInput.length ? normalizedCountry : normalizedInput;
        const shorter = normalizedCountry.length > normalizedInput.length ? normalizedInput : normalizedCountry;
        const partialScore = shorter.length / longer.length;
        
        // Require at least 60% match for partial matches
        if (partialScore >= 0.6) {
            return partialScore;
        }
    }

    // Calculate similarity score
    let bestScore = similarityScore(normalizedInput, normalizedCountry);
    
    // Also check against accepted names
    for (const acceptedName of acceptedNames) {
        const score = similarityScore(normalizedInput, acceptedName);
        if (score > bestScore) {
            bestScore = score;
        }
    }

    // Only return matches with similarity >= 0.75 (allows for 1-2 character typos)
    // For very short inputs (3-4 chars), require higher similarity
    const minSimilarity = normalizedInput.length <= 4 ? 0.85 : 0.75;
    
    return bestScore >= minSimilarity ? bestScore : null;
}

/**
 * Find the best matching country using fuzzy matching
 */
export function findBestFuzzyMatch<T extends { name: string; code: string; acceptedNames: string[] }>(
    input: string,
    countries: T[],
    excludeCodes: Set<string> = new Set()
): { country: T; score: number } | null {
    let bestMatch: { country: T; score: number } | null = null;

    for (const country of countries) {
        if (excludeCodes.has(country.code)) continue;

        const score = fuzzyMatchCountry(input, country.name, country.acceptedNames);
        
        if (score !== null) {
            if (!bestMatch || score > bestMatch.score) {
                bestMatch = { country, score };
            }
        }
    }

    return bestMatch;
}

