import { User } from "@/models/user.model";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  
    try {
        const payload = await getCurrentUser(req);
  if (!payload || !payload._id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 404 }
    );
  }

  const { username } = params;

  if (!username.trim()) {
    return NextResponse.json(
      { success: false, message: "Username is required" },
      { status: 400 }
    );
  }

  await ConnectDB();

  const isUserExist = await User.findOne({username})
  if(!isUserExist){
    return NextResponse.json({success : false, message: "User not found"},{status : 404})
  }
  const channel = await User.aggregate([
    {
      $match: { username: username },
    },
    {
      // Here i am going to write lookup stage for left joining two documents on the basis of a similar field value
      // Here from this lookup i will get the subscribers this user have where the logic is simple that when a user subscribes to a channel a new subscription document got created and then in this lookup we're matching for all the channels which has similar _id like this user from this we'll get the subscribers
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },

    {
      //  This lookup is to find out the channels this user has subscribed
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },

    {
      // Both these lookups will create an arrays so while in this scenraio we don't need those arrays of objects in our users field that's why i am going to use addFields
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },

        // Now, as we want to show that this user who's accessing the channel data of the user has subscribed his channel or not so for that we'll simply see if the user id of the current logged in user is present in the database or not
        isSubscribed: {
          $cond: {
            // Here we're checking that the current logged in user is present or not in the channel's subscribers field
            if: { $in: [new mongoose.Types.ObjectId(payload._id as string), "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },

    // we'll only give the selected fields to the user using project operator
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        isAcceptingMessages : 1
      },
    },
  ]);


  if(!(await channel).length) return NextResponse.json({success : false, message : "Channel Doesn't Exist"})

    return NextResponse.json({success : true,data : channel[0], message : "User fetched successfully"})
    } catch (error) {
        return NextResponse.json({success : false, error},{status : 500})
    }


}
