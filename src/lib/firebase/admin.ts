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

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  'resepedia-d0a52';

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.trim();
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');
}

const serviceAccountFile = path.join(process.cwd(), 'firebase-service-account.json');

export const hasAdminCredentials: boolean = Boolean(
  (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(serviceAccountFile)) ||
  (clientEmail && privateKey)
);

let adminApp: App;

if (!getApps().length) {
  if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(serviceAccountFile)) {
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
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (e) {
      console.error('Failed to initialize Firebase Admin with cert:', e);
      adminApp = initializeApp({ projectId });
    }
  } else {
    // Fallback for build time or environments without credentials
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
