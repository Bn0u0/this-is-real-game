import { Client, Account, Databases } from 'appwrite';

const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!ENDPOINT || !PROJECT_ID) {
    console.warn('⚠️ [Appwrite] Missing Env Vars. Backend sync will fail.');
}

const client = new Client();

client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

// [CAUTION] SSL Security Warning & Fix:
// Use self-signed certificates for local development (OrbStack/Local LAN).
(client as any).setSelfSigned(true);

export const account = new Account(client);
export const databases = new Databases(client);

// IDs from TITAN Integration Guide
export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'picnest_db';
export const COLLECTION_PROFILES = import.meta.env.VITE_APPWRITE_COLLECTION_PROFILES || 'profiles';
export const COLLECTION_ITEMS = import.meta.env.VITE_APPWRITE_COLLECTION_ITEMS || 'items';

export default client;
