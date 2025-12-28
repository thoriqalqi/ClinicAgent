
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = 'AIzaSyBAvUbydBIMqMGtAqlB741TbGy_kAzSWRQ';
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log(`Success! Response: ${response.text()}`);
    } catch (error) {
        console.error(`Error with ${modelName}:`, error.message);
    }
}

async function main() {
    await testModel("gemini-2.0-flash");
}

main();
