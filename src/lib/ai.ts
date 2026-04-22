import { GoogleGenAI } from "@google/genai";

// Debugging log as requested
console.log("Checking API Key...", !!(import.meta as any).env?.VITE_GEMINI_API_KEY);

// החלפת הגישה לטובת גמישות ב-Deployment (Vercel/AI Studio)
const meta = import.meta as any;
const apiKey = meta.env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

if (!apiKey) {
  const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel');
  const message = isVercel 
    ? 'Missing Gemini API Key: Set "VITE_GEMINI_API_KEY" in your Vercel Project Settings > Environment Variables.'
    : 'Missing Gemini API Key: Add "GEMINI_API_KEY" to the Secrets panel in AI Studio.';
  
  console.error(message);
  
  // Browser alert for end-user visibility as requested
  if (typeof window !== 'undefined' && isVercel) {
    alert('שגיאת מערכת: מפתח Gemini לא הוגדר ב-Vercel');
  }
}

export const isAiConfigured = !!apiKey;

export const ai = new GoogleGenAI({ 
  apiKey: apiKey || 'dummy-key-to-prevent-crash' 
});
