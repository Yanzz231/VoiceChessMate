import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOqe8-PY-MnRDvvoF_3s3ubYFDSk7GpsI",
  authDomain: "voicechessmate.firebaseapp.com",
  projectId: "voicechessmate",
  storageBucket: "voicechessmate.firebasestorage.app",
  messagingSenderId: "99152066748",
  appId: "1:99152066748:web:d7635920e2da476066b8b9",
  measurementId: "G-ZCZ61NXWJ2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
export default app;
