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
    if (!tweet)
      return NextResponse.json({
        success: false,
        message: "Unable to create tweet",
      });

    return NextResponse.json({
      success: true,
      data: tweet,
      message: "Tweet created successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}

// Controller for getting user tweets using their ID
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    await ConnectDB();
    const isTweetExist = await Tweet.findOne({
      owner: userId,
    });

    if (!isTweetExist)
      return NextResponse.json(
        { success: false, message: "Tweet not found" },
        { status: 404 }
      );
    return NextResponse.json(
      { success: true, message: "Tweets fetched successfully." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}

// Controller for updating user tweets
export async function PATCH(
  req: NextRequest,
  { params }: { params: { tweetId: string } }
) {
  try {
    const { tweetId } = params;
    const { content } = await req.json();
    if (!content)
      return NextResponse.json(
        { success: false, message: "Content is required" },
        { status: 400 }
      );
    await ConnectDB();
    const isTweetExist = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        content,
      },
      { new: true }
    );
    if (!isTweetExist)
      return NextResponse.json(
        { success: false, message: "Tweet doesn't exist" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      data : isTweetExist,
      message: "Tweet updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}


// Controller for deleting user tweet
export async function DELETE(req : NextRequest,
    { params }: { params: { tweetId: string } }
){
    try {
        const { tweetId } = params
    
        await ConnectDB()
        const isTweetExist = await Tweet.findByIdAndDelete(tweetId)
        if(!isTweetExist) return NextResponse.json({success : false, message : "Tweet doesn't exist"},{status : 400})
    
        return NextResponse.json({success : true, data : isTweetExist , message : "Tweet deleted successully"},{status : 200})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}