import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

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

let adminApp: App | undefined;

if (hasAdminCredentials) {
  if (!getApps().length) {
    if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(serviceAccountFile)) {
      try {
        const sa = JSON.parse(fs.readFileSync(serviceAccountFile, 'utf-8'));
        adminApp = initializeApp({
          credential: cert(sa),
          projectId: sa.project_id || projectId,
        });
      } catch (e) {
        console.error('[Resepedia Admin] Failed to parse service account file:', e);
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
        console.error('[Resepedia Admin] Failed to initialize Firebase Admin with cert:', e);
      }
    }
  } else {
    adminApp = getApps()[0];
  }
}

let adminDbInstance: Firestore | null = null;
if (hasAdminCredentials && adminApp) {
  try {
    adminDbInstance = getFirestore(adminApp);
  } catch (err) {
    console.error('[Resepedia Admin] Failed to get Firestore instance:', err);
    adminDbInstance = null;
  }
}

export const adminDb: Firestore = adminDbInstance as Firestore;

export default adminApp;
