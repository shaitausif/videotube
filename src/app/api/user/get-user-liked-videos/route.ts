import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Like } from "@/models/like.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// This controller is responsible for getting the likedVideos of currently loggedInUser
export async function GET(req: NextRequest) {
  try {
    const payload = await getCurrentUser(req);
    if (!payload)
      return NextResponse.json(
        { success: false, messasge: "Unauthorized" },
        { status: 401 }
      );

    const likedVideos = await Like.aggregate([
      // 1st stage: Filter out all the liked videos Documents
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(payload._id as string),
          video: { $ne: null },
        },
      },
      // 2nd Stage:
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      fullName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind : "$owner"
            },
            {
              $project: {
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                owner : 1
              },
            },
          ],
        },
        
      },
      {
        $unwind : "$video"
      },
      {
        $replaceRoot : { newRoot : "$video" }
      }
    ]);
    
    if(!likedVideos) return NextResponse.json({success : false, message :"Internal server error"},{status : 500})
        return NextResponse.json({success : true, message : "Liked Videos fetched successfully.", data : likedVideos})

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
