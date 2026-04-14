import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDDh45VYtoAugchM8xK8BYSN06VS2iGZWw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'malwa-hardware.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'malwa-hardware',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'malwa-hardware.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1004546652236',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1004546652236:web:0e770b499a0e992e609ce9',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-VRLMYYZ34C'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = initializeFirestore(app, {
  // Helps in networks where Firestore's default streaming transport stalls.
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false
});
export const googleProvider = new GoogleAuthProvider();

if (import.meta.env.DEV) {
  console.log('[Firebase] Initialized', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
}
