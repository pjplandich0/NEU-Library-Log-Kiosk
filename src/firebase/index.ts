'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase.
 * On Vercel, we explicitly provide the firebaseConfig object.
 * This function handles potential missing configuration to prevent 'no-options' errors
 * and ensure idempotent initialization.
 */
export function initializeFirebase() {
  const apps = getApps();
  if (apps.length > 0) {
    return getSdks(getApp());
  }

  // Ensure we have a valid config before calling initializeApp.
  // If environment variables are missing on Vercel, we log a specific error.
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "undefined") {
    console.error("Firebase Configuration Error: API Key is missing. Please set NEXT_PUBLIC_FIREBASE_ environment variables in your Vercel project settings.");
  }

  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
