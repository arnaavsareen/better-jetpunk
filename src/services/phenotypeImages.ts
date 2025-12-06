// Phenotype image service - manages locally generated images
import type { EthnicGroup } from '../data/ethnicGroups';

/**
 * Get image URL for a phenotype and gender
 * Uses locally generated images from /images/phenotypes/
 */
export function getPhenotypeImageUrl(group: EthnicGroup, gender: 'male' | 'female' = 'male'): string {
    if (!group.imageKey) {
        return '';
    }
    
    const imageKey = `${group.imageKey}${gender === 'male' ? 'm' : 'f'}`;
    
    // Use direct path to images in public folder
    return `/images/phenotypes/${imageKey}.jpg`;
}

/**
 * Check if image exists (for better error handling)
 */
export async function checkImageExists(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get fallback URLs (empty for now since we use local images)
 */
export function getPhenotypeImageFallbackUrls(_group: EthnicGroup, _gender: 'male' | 'female' = 'male'): string[] {
    // No fallbacks needed for local images
    return [];
}

