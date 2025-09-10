import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Tweet } from "@/models/tweet.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";



// Controller for getting user tweets using their ID
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const payload = await getCurrentUser(req)
    await ConnectDB();
    // const isTweetExist = await Tweet.find({
    //     owner : userId
    // }).populate({
    //     path : "owner",
    //     select : "username avatar fullName"
    // })

    const isTweetExist = await Tweet.aggregate([
      {
        $match : {
          owner : new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $sort : { createdAt : -1 }
      },
      {
        $lookup : {
          from : "users",
          localField : "owner",
          foreignField : "_id",
          as : 'owner',
          pipeline : [
            {
              $project : {
                avatar : 1,
                fullName : 1,
                username : 1
              }
            }
          ]
        }
      },
      {
        $lookup : {
          from : "likes",
          localField : "_id",
          foreignField : "tweet",
          as : "likesCount"
        }
      },
      {
        $lookup : {
          from : "dislikes",
          localField : "_id",
          foreignField : "tweet",
          as : "disLikesCount"
        }
      },
      { $unwind : "$owner" },
      {
        $addFields : {
          isLiked : {
            $cond : {
              if : { $in : [new mongoose.Types.ObjectId(payload?._id as string), "$likesCount.likedBy"]},
              then : true,
              else : false
            }
          },
          isDisLiked : {
            $cond : {
              if : { $in : [new mongoose.Types.ObjectId(payload?._id as string),"$disLikesCount.disLikedBy"]},
              then : true,
              else : false
            }
          },

          disLikesCount : { $size : "$disLikesCount" },
          likesCount : { $size : "$likesCount" }
        }
      }
    ])


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