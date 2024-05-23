// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbpxQZQ8pFLfy-TA_js4qCF0FyZvz2XH0",
  authDomain: "sudoku-e401c.firebaseapp.com",
  databaseURL: "https://sudoku-e401c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sudoku-e401c",
  storageBucket: "sudoku-e401c.appspot.com",
  messagingSenderId: "752850675308",
  appId: "1:752850675308:web:e3fc64bbbdc75bb1bc5a49",
  measurementId: "G-NBL90CMZH6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
// const analytics = getAnalytics(app);
export { app, database };