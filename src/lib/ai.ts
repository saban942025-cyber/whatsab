import { GoogleGenAI } from "@google/genai";

// Direct check for Gemini API Key
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

if (apiKey && apiKey.length > 20) {
  console.log('API KEY DETECTED');
}

if (!apiKey) {
  const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel');
  const message = isVercel 
    ? 'Missing Gemini API Key: Set "VITE_GEMINI_API_KEY" in your Vercel Project Settings > Environment Variables.'
    : 'Missing Gemini API Key: Add "GEMINI_API_KEY" to the Secrets panel in AI Studio.';
  
  console.warn(message);
}

export const isAiConfigured = !!apiKey;

export const ai = new GoogleGenAI({ 
  apiKey: apiKey || 'dummy-key-to-prevent-crash' 
});
