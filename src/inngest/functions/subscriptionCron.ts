import ConnectDB from "@/lib/dbConnect";
import { inngest } from "../client";
import { User } from "@/models/user.model";
import { sendExpiryEmail } from "../../../helpers/SendExpiryEmail";
import { NonRetriableError } from "inngest";

export const subscriptionCron = inngest.createFunction(
  { id: "user-sub-expiry" },
  { cron: "0 * * * *" }, // runs everyday at midnight
  async () => {
    try {
      // Get all the User documents where the subscription has expired
      await ConnectDB();
      const expiredSubUsers = await User.find({
        "subscription.active": true,
        "subscription.endDate": { $lte: new Date() },
      });

      if (expiredSubUsers.length === 0)
      {
        console.log("No expired plans")
        return { message: "No users plan has expired yet", success: true };
      }
      // Now Send notifications to each user reminding them the expiry of their plan
      for (const user of expiredSubUsers) {
        const res = await sendExpiryEmail(user.email, user.username);
        if (!res.success) {
          throw new NonRetriableError(
            "Failed to send Email to User: ",
            user.username
          );
        }
      }

      await User.updateMany(
        {
          "subscription.active": true,
          "subscription.endDate": { $lte: new Date() },
        },
        {
          $set: {
            "subscription.plan": "free",
            "subscription.active": false,
          },
        }
      );

      return {
        success: true,
        message: `Expired plans downgraded`,
        count: expiredSubUsers.length,
      };
    } catch (error) {
      console.log(error);
    }
  }
);
