// src/lib/ai/gemini.ts
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client according to the gemini-api-dev skill
// We prefer 3-flash-preview as the default model
export const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const GEMINI_DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

export async function generateText(prompt: string, model: string = GEMINI_DEFAULT_MODEL) {
    try {
        const response = await geminiClient.models.generateContent({
            model: model,
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
