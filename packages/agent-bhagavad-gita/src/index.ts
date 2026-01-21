import { SomeModel, generateVerse, parseOutput, saveVerse } from './someDependencies';

const MAX_ATTEMPTS = 3;
const verses = [...]; // Assume we have an array of verses to process

async function processVerses() {
    for (const verse of verses) {
        let attempts = 0;
        let success = false;
        let modelOutput;

        while (attempts < MAX_ATTEMPTS && !success) {
            attempts++;
            try {
                console.log(
                    `Attempt ${attempts} for verse: ${verse.text}`
                );

                modelOutput = await generateVerse(verse.text);
                console.log(
                    `Raw model output for verse '${verse.text}':`,
                    modelOutput
                );

                const parsedOutput = parseOutput(modelOutput);
                await saveVerse(parsedOutput);
                success = true;
                console.log(`Successfully processed verse: ${verse.text}`);

            } catch (error) {
                console.error(
                    `Error processing verse '${verse.text}' (Attempt ${attempts}): ${error.message}`
                );
                if (attempts >= MAX_ATTEMPTS) {
                    console.warn(
                        `Skipping verse '${verse.text}' after ${MAX_ATTEMPTS} attempts.`
                    );
                }
            }
        }
    }
}

processVerses();