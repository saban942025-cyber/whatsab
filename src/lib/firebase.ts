import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp, query } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const meta = import.meta as any;
const env = meta.env || {};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId
};

// Protection for saban-ai-drive project
if (typeof window !== 'undefined' && firebaseConfig.projectId && firebaseConfig.projectId.startsWith('gen-lang')) {
  console.warn('שגיאה: פרויקט זמני מזוהה (gen-lang). יש לעבור לפרויקט saban-ai-drive.');
}
if (typeof window !== 'undefined' && firebaseConfig.projectId && firebaseConfig.projectId !== 'saban-ai-drive' && !firebaseConfig.projectId.startsWith('gen-lang')) {
  alert('שגיאה: הגדרות Firebase אינן תואמות לפרויקט Saban');
}

const app = initializeApp(firebaseConfig);

// Debugging log with config metadata lengths
console.log("Firebase Config Status:", {
  apiKeyLength: firebaseConfig.apiKey?.length || 0,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Order Sync Mechanism
const orderStatusCache = new Map<string, string>();

export const startOrderSync = () => {
  const q = query(collection(db, 'orders'));
  
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      const data = change.doc.data();
      const orderId = change.doc.id;
      const newStatus = data.status || 'pending';
      const oldStatus = orderStatusCache.get(orderId);

      if (change.type === 'added') {
        orderStatusCache.set(orderId, newStatus);
      }

      if (change.type === 'modified' && oldStatus && oldStatus !== newStatus) {
        orderStatusCache.set(orderId, newStatus);
        
        // Map status to Hebrew for better UI
        const statusMap: Record<string, string> = {
          'pending': 'ממתין',
          'approved': 'אושר',
          'in_transit': 'בדרך',
          'delivered': 'נמסר',
          'cancelled': 'בוטל'
        };

        const oldLabel = statusMap[oldStatus] || oldStatus;
        const newLabel = statusMap[newStatus] || newStatus;

        try {
          await addDoc(collection(db, 'messages'), {
            text: `📦 עדכון הזמנה: סטטוס הזמנה #${orderId.slice(-4)} שונה מ-"${oldLabel}" ל-"${newLabel}"`,
            senderId: 'system',
            senderName: 'SabanOS',
            timestamp: serverTimestamp(),
            type: 'system'
          });
        } catch (err) {
          console.error("Failed to post order update message:", err);
        }
      }
      
      if (change.type === 'removed') {
        orderStatusCache.delete(orderId);
      }
    });
  });
};

export let isDomainAuthorized = true;
const domainErrorListeners: ((status: boolean) => void)[] = [];

export const onDomainError = (callback: (status: boolean) => void) => {
  domainErrorListeners.push(callback);
};

const notifyDomainError = () => {
  isDomainAuthorized = false;
  domainErrorListeners.forEach(cb => cb(false));
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    isDomainAuthorized = true;
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain') {
       notifyDomainError();
       const domain = window.location.hostname;
       console.error(`Unauthorized Domain: ${domain}. Add this to your Firebase Authorized Domains list.`);
    } else if (error?.code === 'auth/popup-closed-by-user') {
       console.log("Sign-in popup closed by user.");
    } else {
       console.error("Auth error:", error);
    }
    return null;
  }
};
