import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.resolve(__dirname, '../.env');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim().replace(/^["']|["']$/g, '');
    }
} catch (e) {
    console.error("Could not read .env file:", e.message);
    process.exit(1);
}

if (!apiKey) {
    console.error("VITE_API_KEY not found in .env");
    process.exit(1);
}

console.log("Checking models with API Key ending in...", apiKey.slice(-4));

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }

        const outputPath = path.resolve(__dirname, 'models_output.json');
        if (data.models) {
            const models = data.models.map(m => m.name);
            fs.writeFileSync(outputPath, JSON.stringify(models, null, 2));
            console.log("Models written to models_output.json");
        } else {
            fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
            console.log("Raw data written to models_output.json");
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
}

listModels();
