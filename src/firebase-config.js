import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCnyb0kzBhzj_CoyzeWm3q0bzRH50ChJtw",
    authDomain: "absproject-3badf.firebaseapp.com",
    projectId: "absproject-3badf",
    storageBucket: "absproject-3badf.appspot.com",
    messagingSenderId: "720193661276",
    appId: "1:720193661276:web:47c918f28e0f8f2223b999",
    measurementId: "G-DRTBM136SC"
  };

  const app = initializeApp(firebaseConfig);

  export const db = getFirestore();