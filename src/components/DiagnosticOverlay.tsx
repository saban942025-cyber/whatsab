import React, { useState } from 'react';
import { firebaseConfig } from '../lib/firebase';
import { isAiConfigured } from '../lib/ai';
import { Shield, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DiagnosticOverlay({ userEmail }: { userEmail: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Only show for the admin user
  const isAdmin = userEmail === 'saban942025@gmail.com';
  if (!isAdmin) return null;

  const projectId = firebaseConfig.projectId || '';
  const authDomain = firebaseConfig.authDomain || '';
  
  const isProjectOk = projectId === 'saban-ai-drive';
  const isProjectTemp = projectId.startsWith('gen-lang');
  
  const isAuthDomainOk = authDomain.includes('saban');
  
  return (
    <div className="fixed bottom-4 right-4 z-[999] max-w-sm w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-xl shadow-lg flex items-center justify-between transition-all ${
          isOpen ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${isProjectOk && isAuthDomainOk && isAiConfigured ? 'text-green-500' : 'text-red-500'}`} />
          <span className="font-bold text-sm">אבחון מערכת SabanOS</span>
        </div>
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <table className="w-full text-xs text-right" dir="rtl">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">פרמטר</th>
                    <th className="pb-2 font-medium">סטטוס</th>
                    <th className="pb-2 font-medium">הודעה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="py-2 font-bold">Project ID</td>
                    <td className="py-2">{isProjectOk ? '🟢' : isProjectTemp ? '🔴' : '🟡'}</td>
                    <td className="py-2 text-[10px]">
                      {isProjectOk ? 'תקין' : isProjectTemp ? 'שגיאה: פרויקט זמני' : 'פרויקט לא מוכר'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Auth Domain</td>
                    <td className="py-2">{isAuthDomainOk ? '🟢' : '🔴'}</td>
                    <td className="py-2 text-[10px]">
                      {isAuthDomainOk ? 'תואם' : 'לא תואם'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">Gemini Key</td>
                    <td className="py-2">{isAiConfigured ? '🟢' : '🔴'}</td>
                    <td className="py-2 text-[10px]">
                      {isAiConfigured ? 'מזוהה' : 'חסר'}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-amber-800 leading-tight">
                    <span className="font-bold block mb-1">Domain Status:</span>
                    חובה להוסיף את מה שמופיע כאן: <code className="bg-white px-1 rounded">whatsab.vercel.app</code> ל-Authorized Domains ב-Firebase Console.
                  </p>
                </div>
              </div>
              
              <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded">
                <p>Project ID: {projectId}</p>
                <p>Auth Domain: {authDomain}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
