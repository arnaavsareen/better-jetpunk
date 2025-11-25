import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fetchCountries() {
    try {
        console.log('Fetching countries...');
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,independent');
        const data = await response.json();

        // Filter for independent countries (approx 195-197 usually) to match JetPunk style
        // JetPunk usually has 196 countries.
        const countries = data
            .filter((c) => c.independent !== false) // Keep independent or undefined (some valid ones might be undefined)
            .map((c) => ({
                name: c.name.common,
                code: c.cca2,
                // Add common aliases/alternate spellings if needed later, for now just common name
                acceptedNames: [c.name.common.toLowerCase(), c.name.official.toLowerCase()]
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        console.log(`Found ${countries.length} countries.`);

        const outputPath = path.join(__dirname, '../src/data/countries.json');
        fs.writeFileSync(outputPath, JSON.stringify(countries, null, 2));
        console.log(`Saved to ${outputPath}`);
    } catch (error) {
        console.error('Error fetching countries:', error);
    }
}

fetchCountries();
