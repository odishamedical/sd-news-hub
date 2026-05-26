import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBz0OIk4xmOZras83es5HmJc03Ae60sMg8",
  authDomain: "sd-auth-center.firebaseapp.com",
  projectId: "sd-auth-center",
  storageBucket: "sd-auth-center.firebasestorage.app",
  messagingSenderId: "393346058191",
  appId: "1:393346058191:web:a5e96e1c481a72f86db4ba"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "default");

async function check() {
  console.log("Fetching reporters...");
  try {
    const snap = await getDocs(collection(db, "news_reporters"));
    console.log("Total reporters:", snap.size);
    snap.forEach(doc => {
      console.log(doc.id, "=>", doc.data().email, doc.data().fullName);
    });
  } catch(e) {
    console.error("Error:", e);
  }
}
check();
