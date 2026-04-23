import React, { useEffect, useState } from 'react';
import { AlertCircle, Terminal, CheckCircle2, XCircle, Settings, ExternalLink, Copy } from 'lucide-react';
import { isAiConfigured } from '../lib/ai';
import { isDomainAuthorized, onDomainError, firebaseConfig } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function SystemCheck() {
  const [authError, setAuthError] = useState(!isDomainAuthorized);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const projectId = firebaseConfig.projectId || '';
  const isProjectTemp = projectId.startsWith('gen-lang');
  const isProjectOk = projectId === 'saban-ai-drive';
  const targetDomain = 'whatsab.vercel.app';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(targetDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const firebaseConsoleLink = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  useEffect(() => {
    onDomainError(() => setAuthError(true));
    
    // Show system check if something is wrong
    if (!isAiConfigured || authError || isProjectTemp) {
      setIsVisible(true);
    }
  }, [authError, isProjectTemp]);

  if (!isVisible && isAiConfigured && !authError && !isProjectTemp) return null;

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

            <div className="p-4 space-y-3" dir="rtl">
              {/* AI Key Check */}
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 text-right">
                  <Terminal className={`w-5 h-5 ${isAiConfigured ? 'text-green-500' : 'text-amber-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-700">מפתח Gemini AI API</p>
                    <p className="text-[10px] text-gray-500">{isAiConfigured ? 'מוגדר בהצלחה' : 'חסר ב-Environment Variables'}</p>
                  </div>
                </div>
                <CheckCircle2 className={`w-5 h-5 ${isAiConfigured ? 'text-green-500' : 'text-gray-300'}`} />
              </div>

              {/* Firebase Auth Check */}
              <div className={`flex items-center justify-between p-2 rounded-lg border ${authError ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-3 text-right">
                  <XCircle className={`w-5 h-5 ${authError ? 'text-red-500' : 'text-green-500'}`} />
                  <div>
                    <p className={`text-xs font-bold ${authError ? 'text-red-700' : 'text-gray-700'}`}>אישור דומיין (Firebase Auth)</p>
                    <p className={`text-[10px] ${authError ? 'text-red-500' : 'text-gray-500'}`}>
                      {authError ? '🚨 דומיין לא מאושר - יש לאשר ב-Firebase Console' : 'תקין'}
                    </p>
                  </div>
                </div>
                {authError && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-1.5 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors text-red-600 flex items-center gap-1 text-[10px] font-bold pointer-events-auto"
                      title="העתק דומיין"
                    >
                      {copied ? 'הועתק!' : <><Copy className="w-3 h-3" /> העתק</>}
                    </button>
                    <a 
                      href={firebaseConsoleLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors pointer-events-auto"
                      title="פתח הגדרות Firebase"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Project ID Check */}
              {isProjectTemp && (
                <div className="flex items-center justify-between bg-red-50 p-2 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3 text-right">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs font-bold text-red-700">סביבת פיתוח זמנית (gen-lang)</p>
                      <p className="text-[10px] text-red-500">יש לעבור לפרויקט saban-ai-drive</p>
                    </div>
                  </div>
                  <XCircle className="w-5 h-5 text-red-300" />
                </div>
              )}

              {(authError || isProjectTemp) && (
                <div className="bg-red-50 p-3 rounded border border-red-100 space-y-2">
                  <p className="text-[11px] text-red-700 text-center font-bold">
                    הנחיות לפתרון:
                  </p>
                  <ol className="text-[10px] text-red-600 list-decimal list-inside space-y-1 text-right">
                    <li>העתק את הדומיין: <code className="bg-red-100 px-1 rounded font-mono">{targetDomain}</code></li>
                    <li>לחץ על האייקון <ExternalLink className="w-3 h-3 inline pb-0.5" /> למעלה כדי לפתוח את הגדרות הפרויקט.</li>
                    <li>הדבק את הדומיין תחת לשונית "Authorized domains".</li>
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
