import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";


// This is a setup for firebase connection on the client
// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_API_KEY,
  authDomain: "videotube-d7b32.firebaseapp.com",
  projectId: "videotube-d7b32",
  storageBucket: "videotube-d7b32.firebasestorage.app",
  messagingSenderId: "247839964675",
  appId: "1:247839964675:web:b86795e99b0e29b8d25836",
  measurementId: "G-2WGTNVTJTM"
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

// It basically generate a unique registration token for each user for their identification and then sending the notifications to them
export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export { app, messaging };
