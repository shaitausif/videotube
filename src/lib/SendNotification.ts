import { User } from "@/models/user.model";
import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import mongoose from "mongoose";

// Initialize Firebase Admin SDK

if (!admin.apps.length) {
  // I had generated the private key from here: https://console.firebase.google.com/u/0/project/videotube-d7b32/settings/serviceaccounts/adminsdk

  // The service key is just credentials that allow a backend to talk to Firebase Admin SDK.
  const serviceAccount = require(`@/service_key.json`)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


// This function is responsible for sending the messages to individual users
export async function SendNotification({userId, token, title, body, link}: {
    userId : string,
    token : string,
    title : string,
    body : string,
    link : string
}) {

    if(!token || !title || !body || !link){
        console.log("All fields are required.")
        return;
    }

  const payload: Message = {
    token,
    notification: {
      title,
      body,
    },
    webpush: {
      fcmOptions: {
        link,
      },
    },
  };

  try {
    // The below line of code is responsible for sending the push notification to FCM servers which then sends the notification to appropriate user by identifying their registration token
    await admin.messaging().send(payload);

  } catch (error: any) {
    if(error.code === "messaging/registration-token-not-registered"){
            await User.updateOne(
                {
                    _id : new mongoose.Types.ObjectId(userId)
                }, 
                { $pull : { fcmTokens : token } }
            )
      
            console.log("Invalid token error",token)

        }
        else{
            console.log(error)
        }

    
  }
}
