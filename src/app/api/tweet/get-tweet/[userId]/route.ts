import ConnectDB from "@/lib/dbConnect";
import { Tweet } from "@/models/tweet.model";
import { NextRequest, NextResponse } from "next/server";



// Controller for getting user tweets using their ID
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    await ConnectDB();
    const isTweetExist = await Tweet.find({
        owner : userId
    }).populate({
        path : "owner",
        select : "username avatar fullName"
    })

    if(isTweetExist.length === 0) return NextResponse.json({success : true,data : isTweetExist,message : "No Tweet exist"}, {
        status : 200
    })


    return NextResponse.json({success : true, data : isTweetExist, message : "Tweets fetched successfully."},{status : 200})


  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}