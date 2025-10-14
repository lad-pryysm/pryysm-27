
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';

type FirebaseBundle = { app: FirebaseApp | null; auth: Auth | null };

function createFirebaseClient(): FirebaseBundle {
  if (typeof window === 'undefined') {
    // Running on server - do not initialize the Firebase client SDK
    return { app: null, auth: null };
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth(app);

  // Connect to local auth emulator in development on localhost
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    try {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    } catch (e) {
      // ignore emulator connect errors during build/SSR
    }
  }

  return { app, auth };
}

export function getFirebaseClient(): FirebaseBundle {
  // cache on globalThis to avoid re-initialization during HMR or duplicate imports
  const g = globalThis as any;
  if (!g.__prysm_firebase_client) {
    g.__prysm_firebase_client = createFirebaseClient();
  }
  return g.__prysm_firebase_client as FirebaseBundle;
}

// Backwards-compatible named export for code that expects to import auth/app directly
// but prefer callers to use `getFirebaseClient()` to avoid server-side initialization.
