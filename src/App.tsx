import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, signInWithGoogle, startOrderSync } from './lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Driver, Warehouse, Message } from './types';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ReportingModal from './components/ReportingModal';
import SystemCheck from './components/SystemCheck';
import DiagnosticOverlay from './components/DiagnosticOverlay';
import { Truck, LogIn, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [activeChatId, setActiveChatId] = useState('noa-bridge');
  const [loading, setLoading] = useState(true);
  const [isReportingOpen, setIsReportingOpen] = useState(false);

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data & Background Sync
  useEffect(() => {
    if (!user) return;

    // Automated Sync for Orders
    const unsubOrderSync = startOrderSync();

    // Listen to drivers
    const unsubDrivers = onSnapshot(collection(db, 'drivers'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
      setDrivers(data);
    }, (error) => {
      console.error("Drivers listener error:", error);
    });

    // Listen to warehouses
    const unsubWarehouses = onSnapshot(collection(db, 'warehouses'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse));
      setWarehouses(data);
    }, (error) => {
      console.error("Warehouses listener error:", error);
    });

    return () => {
      unsubOrderSync();
      unsubDrivers();
      unsubWarehouses();
    };
  }, [user]);

  // Seeding
  useEffect(() => {
    if (!user) return;
    
    const seed = async () => {
      try {
        // Use already imported collection/addDoc
        import('firebase/firestore').then(async ({ getDocs, collection: fCollection }) => {
          const driversSnap = await getDocs(fCollection(db, 'drivers'));
          if (driversSnap.empty) {
            const initial = ["עלי", "חכמת"];
            for (const name of initial) {
              await addDoc(collection(db, 'drivers'), { name, status: 'active', currentLocation: 'ממתין למשימה' });
            }
          }
          
          const warehousesSnap = await getDocs(fCollection(db, 'warehouses'));
          if (warehousesSnap.empty) {
            const initial = [{ name: "מחסן החרש", addr: "החרש 1" }, { name: "מחסן התלמיד", addr: "התלמיד 5" }];
            for (const wh of initial) {
              await addDoc(collection(db, 'warehouses'), { name: wh.name, address: wh.addr, inventoryLevel: 'Standard' });
            }
          }

          const ordersSnap = await getDocs(fCollection(db, 'orders'));
          if (ordersSnap.empty) {
            const initial = [
              { customer: "לקוח א", status: "pending", items: ["משטחים X10"] },
              { customer: "לקוח ב", status: "approved", items: ["מוצרי צריכה X5"] }
            ];
            for (const order of initial) {
              await addDoc(collection(db, 'orders'), order);
            }
          }
        });
      } catch (err) {
        console.warn("Seeding skip/failure:", err);
      }
    };
    seed();
  }, [user]);

  // Initial Data Seeding (Mock SabanOS)
  useEffect(() => {
    if (user) {
      // Periodic "System Updates" from SabanOS
      const interval = setInterval(async () => {
        const events = [
          "הזמנה חדשה שויכה לעלי",
          "חכמת בדרך למחסן החרש",
          "עיכוב צפוי באזור פתח תקווה",
          "מפלס מלאי נמוך במחסן התלמיד"
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        // Randomly post a system update
        if (Math.random() > 0.8) {
          await addDoc(collection(db, 'messages'), {
            text: `[SabanOS] ${randomEvent}`,
            senderId: 'system',
            senderName: 'SabanOS',
            timestamp: serverTimestamp(),
            type: 'system'
          });
        }
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-wa-bg">
      <div className="flex flex-col items-center gap-4">
        <Truck className="w-12 h-12 text-wa-teal animate-bounce" />
        <p className="text-gray-500 font-medium">Saban-Connect Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <SystemCheck />
      <DiagnosticOverlay userEmail={user?.email || null} />
      <AnimatePresence mode="wait">
        {!user ? (
        <motion.div 
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-screen w-screen flex items-center justify-center bg-wa-bg"
        >
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-wa-teal rounded-3xl flex items-center justify-center mb-6 shadow-lg rotate-3">
              <Truck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Saban-Connect</h1>
            <p className="text-gray-500 mb-8">Professional Logistics Management Bridge</p>
            
            <button 
              onClick={signInWithGoogle}
              className="w-full py-3.5 bg-wa-teal text-white rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-wa-teal-dark transition-all transform hover:scale-[1.02] shadow-md"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Google
            </button>
            
            <div className="mt-8 pt-8 border-t border-gray-100 w-full">
              <p className="text-xs text-gray-400">Powered by SabanOS & Noa AI</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="whatsapp-container"
        >
          <Sidebar 
            drivers={drivers} 
            warehouses={warehouses} 
            activeChat={activeChatId}
            setActiveChat={setActiveChatId}
          />
          <ChatArea 
            activeChatId={activeChatId}
            activeChatName={
              activeChatId === 'noa-bridge' 
              ? 'נועה (Noa AI Bridge)' 
              : (drivers.find(d => d.id === activeChatId)?.name || warehouses.find(w => w.id === activeChatId)?.name || 'Chat')
            }
            currentUser={user}
          />
          
          {/* Reporting Tool FAB */}
          <button 
            onClick={() => setIsReportingOpen(true)}
            className="fixed bottom-24 right-6 w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-red-700 transition-all hover:scale-110 active:scale-95 z-50 animate-bounce cursor-pointer group"
          >
            <AlertCircle className="w-8 h-8" />
            <span className="absolute -top-10 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              המלשינון - דווח חריגה
            </span>
          </button>

          <ReportingModal 
            isOpen={isReportingOpen} 
            onClose={() => setIsReportingOpen(false)} 
            currentUser={user} 
          />
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
