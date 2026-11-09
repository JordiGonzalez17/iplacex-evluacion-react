import { connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1nwgsowGzr1errd5pxtv2JxXmom3aBII",
  authDomain: "jordi-gonzalez-iplacex.firebaseapp.com",
  projectId: "jordi-gonzalez-iplacex",
  storageBucket: "jordi-gonzalez-iplacex.firebasestorage.app",
  messagingSenderId: "234897015212",
  appId: "1:234897015212:web:0e354f401cac94cac6ba09"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

connectFirestoreEmulator(db, "127.0.0.1", 8080);

export const functions = getFunctions(app, "us-central1");

connectFunctionsEmulator(functions, "127.0.0.1", 5001);
