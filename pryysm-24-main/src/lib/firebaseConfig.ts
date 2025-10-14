// Firebase configuration: prefer environment variables (NEXT_PUBLIC_*) for production
// Fall back to the generated values so local development still works without extra setup.
export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'prysm-v122-05135565-787d2',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:35369720921:web:2b3aa61d1b0e3e99816548',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'prysm-v122-05135565-787d2.firebasestorage.app',
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD-cfe3_eMxDW7U2Q0VPk_-CaBE01ghOSk',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'prysm-v122-05135565-787d2.firebaseapp.com',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-R9BJ8B19D3',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '35369720921'
};
