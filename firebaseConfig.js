// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuKcvwiEvTRcvMM2YBgFn7wMKtWA2wyxc",
  authDomain: "s2sdb-512f2.firebaseapp.com",
  projectId: "s2sdb-512f2",
  storageBucket: "s2sdb-512f2.firebasestorage.app",
  messagingSenderId: "482649739956",
  appId: "1:482649739956:web:d3c307ade9262b5f843de1",
  measurementId: "G-FLL6Y18PX3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db };