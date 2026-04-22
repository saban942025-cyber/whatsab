import { GoogleGenAI } from "@google/genai";

// החלפת הגישה לטובת גמישות ב-Deployment (Vercel/AI Studio)
const meta = import.meta as any;
const apiKey = meta.env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

if (!apiKey) {
  console.error('Missing Gemini API Key: Please set VITE_GEMINI_API_KEY in your environment variables.');
}

export const ai = new GoogleGenAI({ 
  apiKey: apiKey || 'dummy-key-to-prevent-crash' 
});
