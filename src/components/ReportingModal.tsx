import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, AlertTriangle, Clock, Package, UserX, PackageSearch, Image, Mic, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export default function ReportingModal({ isOpen, onClose, currentUser }: ReportingModalProps) {
  const [type, setType] = useState<'delay' | 'damage' | 'behavior' | 'stock' | 'other'>('delay');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incidentTypes = [
    { id: 'delay', label: 'עיכוב בפריקה', icon: Clock },
    { id: 'damage', label: 'נזק לסחורה', icon: Package },
    { id: 'behavior', label: 'התנהגות נהג', icon: UserX },
    { id: 'stock', label: 'חוסר במלאי', icon: PackageSearch },
  ];

  const handleSubmit = async () => {
    if (!description.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'incidents'), {
        type,
        description,
        reporterId: currentUser?.uid || 'guest',
        reporterName: currentUser?.displayName || currentUser?.email || 'User',
        timestamp: serverTimestamp(),
        status: 'new'
      });
      
      // Send a ping to Noa in the global chat
      await addDoc(collection(db, 'messages'), {
        text: `🚨 דיווח חדש התקבל מ-${currentUser?.displayName || 'השטח'}: ${incidentTypes.find(t => t.id === type)?.label}. תיאור: ${description}`,
        senderId: 'system',
        senderName: 'SabanOS',
        timestamp: serverTimestamp(),
        type: 'system'
      });

      onClose();
      setDescription('');
    } catch (err) {
      console.error("Incident report failed:", err);
      alert("הדיווח נכשל, אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-red-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-xl font-bold">המלשינון - דיווח חריגה</h2>
              </div>
              <button onClick={onClose} className="hover:bg-red-700 p-1 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 bg-[#f0f2f5]">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                {incidentTypes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setType(item.id as any)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      type === item.id 
                        ? 'border-red-500 bg-white shadow-md transform scale-[1.02]' 
                        : 'border-white bg-white/50 text-gray-500 hover:bg-white'
                    }`}
                  >
                    <item.icon className={`w-8 h-8 mb-2 ${type === item.id ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 mr-1">תיאור האירוע :</label>
                <div className="bg-white rounded-xl shadow-inner border border-gray-100 overflow-hidden">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="פרט כאן את מה שקרה..."
                    className="w-full h-32 p-4 focus:outline-none resize-none text-gray-800"
                    dir="rtl"
                  />
                  <div className="bg-gray-50 p-2 flex border-t border-gray-100 gap-4 px-4 text-gray-500">
                    <button className="hover:text-red-500 transition-colors"><Image className="w-5 h-5" /></button>
                    <button className="hover:text-red-500 transition-colors"><Mic className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!description.trim() || isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                  isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
                }`}
              >
                {isSubmitting ? 'שולח דיווח...' : (
                  <>
                    <Send className="w-5 h-5" />
                    שלח דיווח מיידי
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
