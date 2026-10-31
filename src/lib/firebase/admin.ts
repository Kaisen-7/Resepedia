import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Ensure env variables are loaded if running in Node / tsx scripts
if (typeof process !== 'undefined' && process.cwd) {
  dotenv.config();
  try {
    dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true });
  } catch {}
}

let adminApp: App;

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  'resepedia-d0a52';

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
}

const serviceAccountFile = path.join(process.cwd(), 'firebase-service-account.json');

if (!getApps().length) {
  if (fs.existsSync(serviceAccountFile)) {
    try {
      const sa = JSON.parse(fs.readFileSync(serviceAccountFile, 'utf-8'));
      adminApp = initializeApp({
        credential: cert(sa),
        projectId: sa.project_id || projectId,
      });
    } catch {
      adminApp = initializeApp({ projectId });
    }
  } else if (clientEmail && privateKey) {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Fallback for local build without credentials
    adminApp = initializeApp({
      projectId,
    });
  }
} else {
  adminApp = getApps()[0];
}

export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);
export default adminApp;
