import React from 'react';
import { AlertCircle, ExternalLink, Key, Globe } from 'lucide-react';
import { isAiConfigured } from '../lib/ai';

export default function StatusBanner() {
  const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel');
  const [isAuthError, setIsAuthError] = React.useState(false);

  // We can't easily detect the Firebase Auth error from here without a global state, 
  // but we can at least show the AI key warning.
  
  if (isAiConfigured) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 p-3 flex flex-col sm:flex-row items-center justify-center gap-4 text-amber-800 text-sm font-medium z-[100]">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-amber-600 animate-pulse" />
        <span>מפתח Gemini AI חסר ב-Environment Variables</span>
      </div>
      
      <div className="flex items-center gap-3">
        {isVercel ? (
          <a 
            href="https://vercel.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-full transition-colors text-amber-900"
          >
            <Key className="w-4 h-4" />
            הגדר ב-Vercel (VITE_GEMINI_API_KEY)
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            הוסף GEMINI_API_KEY ב-Secrets של AI Studio
          </span>
        )}
        
        <a 
          href="https://console.firebase.google.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full transition-colors text-blue-800 border border-blue-200"
        >
          <Globe className="w-4 h-4" />
          אישור דומיין ב-Firebase
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
