// services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "pytholingo.firebaseapp.com",
  databaseURL: "https://pytholingo-default-rtdb.firebaseio.com",
  projectId: "pytholingo",
  storageBucket: "pytholingo.appspot.com",
  messagingSenderId: "755959686276",
  appId: "1:755959686276:web:c3787c951a00ccae470ed1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
