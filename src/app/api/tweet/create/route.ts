import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { SendNotification } from "@/lib/SendNotification";
import { Tweet } from "@/models/tweet.model";
import { User } from "@/models/user.model";
import { after, NextRequest, NextResponse } from "next/server";

// Controller for posting tweets
export async function POST(req: NextRequest) {
  try {
    const {payload, cookies} = await getCurrentUser(req);
    if (!payload)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const { content } = await req.json();
    if (!content)
      return NextResponse.json(
        { success: false, message: "Content is required" },
        { status: 400 }
      );

    await ConnectDB();
    const tweet = await Tweet.create({
      content,
      owner: payload._id,
    });

    const newTweet = await tweet.populate("owner", "username avatar fullName");
    if (!tweet)
      return NextResponse.json({
        success: false,
        message: "Unable to create tweet",
      });

    after(async () => {
      const parts = content.split(/(@\w+)/g);

      const usernames = parts
        .filter((part: string) => part.startsWith("@"))
        .map((mention: string) => mention.slice(1)); // remove @

      const mentionedUsers = await User.find({
        username: { $in: usernames },
      }).select("_id fcmTokens username");
      if (!mentionedUsers.length) return;
      console.log(mentionedUsers)

      mentionedUsers
        .filter((user) => user._id.toString() !== payload?._id?.toString())
        .forEach((user) => {

         
          user.fcmTokens.forEach((token: string, ) => {
            if (token){
              console.log("Message Sent to", user.username);
              SendNotification({
                userId: user._id,
                token,
                title: `${payload.username} has mentioned you in his tweet`,
                body: "You have been mentioned",
                link: `http://localhost:3000/c/${payload.username}`,
              });
            }
          });
        });
    });

    return NextResponse.json({
      success: true,
      data: newTweet,
      message: "Tweet created successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
