// Current content of the file should be fetched here to update with changes accordingly.
// Sample content starts

import { generateVerse, parseVerse, saveVerse } from './utils';

async function processVerses(verses) {
    for (const verse of verses) {
        try {
            // Generate verse output
            const rawOutput = await generateVerse(verse);
            console.log('Raw model output:', rawOutput);

            // Parse the output
            const parsedVerse = parseVerse(rawOutput);

            // Save the parsed verse
            await saveVerse(parsedVerse);
        } catch (error) {
            console.error(`Error processing verse ${verse.id}:`, error);
            // Optionally: Log to GitHub Actions
        }
    }
}

export default processVerses;
// Sample content ends
