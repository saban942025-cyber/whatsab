import React, { useEffect, useState } from 'react';
import { AlertCircle, Terminal, CheckCircle2, XCircle, Settings, ExternalLink } from 'lucide-react';
import { isAiConfigured } from '../lib/ai';
import { isDomainAuthorized, onDomainError } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function SystemCheck() {
  const [authError, setAuthError] = useState(!isDomainAuthorized);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    onDomainError(() => setAuthError(true));
    
    // Show system check summary in console or small toast
    if (!isAiConfigured || authError) {
      setIsVisible(true);
    }
  }, [authError]);

  if (!isVisible && isAiConfigured && !authError) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4 pointer-events-none">
      <AnimatePresence>
        {(authError || !isAiConfigured) && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-red-100 overflow-hidden pointer-events-auto"
          >
            <div className="bg-red-600 px-4 py-2 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>בדיקת מערכת קריטית - SabanOS</span>
              </div>
              <button onClick={() => setIsVisible(false)} className="text-white/80 hover:text-white">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* AI Key Check */}
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <Terminal className={`w-5 h-5 ${isAiConfigured ? 'text-green-500' : 'text-amber-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-700">מפתח Gemini AI API</p>
                    <p className="text-[10px] text-gray-500">{isAiConfigured ? 'מוגדר בהצלחה' : 'חסר ב-Environment Variables'}</p>
                  </div>
                </div>
                {!isAiConfigured && (
                  <CheckCircle2 className="w-5 h-5 text-gray-300" />
                )}
                {isAiConfigured && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>

              {/* Firebase Auth Check */}
              <div className={`flex items-center justify-between p-2 rounded-lg border ${authError ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <XCircle className={`w-5 h-5 ${authError ? 'text-red-500' : 'text-green-500'}`} />
                  <div>
                    <p className={`text-xs font-bold ${authError ? 'text-red-700' : 'text-gray-700'}`}>אישור דומיין (Firebase Auth)</p>
                    <p className={`text-[10px] ${authError ? 'text-red-500' : 'text-gray-500'}`}>
                      {authError ? '🚨 דומיין לא מאושר - יש לאשר ב-Firebase Console' : 'תקין'}
                    </p>
                  </div>
                </div>
                {authError ? (
                  <a 
                    href="https://console.firebase.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-red-200 rounded-md transition-colors text-red-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>

              {authError && (
                <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-100 text-center font-medium animate-pulse">
                  לתשומת לבך: פעולות כמו התחברות או שליחת הודעות לא יעבדו ללא אישור הדומיין.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
