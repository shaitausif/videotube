import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Tweet } from "@/models/tweet.model";
import { NextRequest, NextResponse } from "next/server";



// Controller for posting tweets
export async function POST(req: NextRequest) {
  try {
    const payload = await getCurrentUser(req);
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

    const newTweet = await tweet.populate("owner","username avatar fullName")
    if (!tweet)
      return NextResponse.json({
        success: false,
        message: "Unable to create tweet",
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