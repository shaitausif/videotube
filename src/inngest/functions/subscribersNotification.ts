import { Subscription } from "@/models/subscription.model";
import { inngest } from "../client";
import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";
import { NonRetriableError } from "inngest";

// Initialize Firebase Admin once
if (!admin.apps.length) {
  const serviceAccount = require("../../service_key.json"); // use correct relative path
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const subscribersNotification = inngest.createFunction(
  { id: "user-subscriber" },
  { event: "user/subscriber" },
  async ({ event }) => {
    try {
      const { userId, title, description, videoId } = event.data;
      if (!userId || !title || !description || !videoId) {
        throw new NonRetriableError("All Fields are required.");
      }

      const subscribers = await Subscription.find({ channel: userId }).populate({
        path: "subscriber",
        select: "fcmTokens _id username",
      });

      if (!subscribers || subscribers.length === 0) {
        return { success: true, message: "No subscribers found" };
      }

      const videoUrl: string = `http://localhost:3000/video/${videoId}`;

      // Collect promises
      const sendPromises: Promise<string>[] = [];

      subscribers.forEach((subscription) => {
        const tokens = subscription.subscriber?.fcmTokens || [];
        tokens.forEach((token: string) => {
          if (token) {
            const payload: Message = {
              token,
              notification: {
                title,
                body: description,
              },
              webpush: {
                fcmOptions: {
                  link: videoUrl,
                },
              },
            };
            sendPromises.push(admin.messaging().send(payload));
          }
        //   console.log(subscription.subscriber.username, token)
        });
      });

      // Wait for all notifications
      await Promise.all(sendPromises);

      console.log("Video Notification sent successfully");
      return { success: true, message: "Notifications sent" };
    } catch (error: any) {
      console.error("Error running step", error.message);
      return { success: false, error: error.message };
    }
  }
);
