import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Tweet } from "@/models/tweet.model";
import { NextRequest, NextResponse } from "next/server";
import { TweetSchema } from "@/schemas/TweetSchema";





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
      const result = TweetSchema.safeParse({tweet : content})
      if(!result.success) return NextResponse.json({success : false, message : "Invalid inputs"}, {status : 400})
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