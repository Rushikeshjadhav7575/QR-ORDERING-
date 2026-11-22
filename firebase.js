
import { initializeApp } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// YOUR FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "PASTE_YOUR_API_KEY",
    authDomain: "PASTE_YOUR_AUTH_DOMAIN",
    projectId: "PASTE_YOUR_PROJECT_ID",
    storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
    messagingSenderId: "PASTE_YOUR_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID"
};

// CHECK CONFIGURATION
export const isFirebaseConfigured =
    !Object.values(firebaseConfig).some(value =>
        String(value).startsWith("PASTE_") ||
        String(value).trim() === ""
    );

// INITIALIZE FIREBASE
let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    console.log("Firebase connected successfully!");
} else {
    console.log("Firebase configuration is pending.");
}

export { app, db, auth };
