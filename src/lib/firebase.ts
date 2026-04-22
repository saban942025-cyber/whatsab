import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const meta = import.meta as any;
const env = meta.env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId
};

const app = initializeApp(firebaseConfig);

// Debugging log with config metadata lengths
console.log("Firebase Config Status:", {
  apiKeyLength: firebaseConfig.apiKey?.length || 0,
  projectIdLength: firebaseConfig.projectId?.length || 0,
  authDomain: firebaseConfig.authDomain
});

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain') {
       const domain = window.location.hostname;
       alert(`Domain Unauthorized: The domain "${domain}" is not authorized for Firebase Auth.\n\nPlease add it in: Firebase Console > Authentication > Settings > Authorized Domains.`);
       console.error(`Unauthorized Domain: ${domain}. Add this to your Firebase Authorized Domains list.`);
    } else if (error?.code === 'auth/popup-closed-by-user') {
       console.log("Sign-in popup closed by user.");
    } else {
       alert('שגיאת התחברות: ' + (error?.message || 'אנא נסה שוב מאוחר יותר.'));
       console.error("Auth error:", error);
    }
    // No throw here to prevent "Uncaught in promise" in the UI layer
    return null;
  }
};
