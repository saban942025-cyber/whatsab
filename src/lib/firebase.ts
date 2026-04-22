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

// Protection for sidor-ai project
if (typeof window !== 'undefined' && firebaseConfig.projectId !== 'sidor-ai') {
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
