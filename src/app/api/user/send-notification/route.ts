import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // I had generated the private key from here: https://console.firebase.google.com/u/0/project/videotube-d7b32/settings/serviceaccounts/adminsdk

  const serviceAccount = require("@/service_key.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(request: NextRequest) {
  const { token, title, message, link } = await request.json();

  const payload: Message = {
    token,
    notification: {
      title: title,
      body: message,
    },
    webpush: link && {
      fcmOptions: {
        link,
      },
    },
  };

  try {
    // The below line of code is responsible for sending the push notification to FCM servers which then sends the notification to appropriate user by identifying their registration token
    await admin.messaging().send(payload);

    return NextResponse.json({ success: true, message: "Notification sent!" });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
