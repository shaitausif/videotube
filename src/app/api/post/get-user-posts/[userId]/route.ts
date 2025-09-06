import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Post } from "@/models/post.models";
import { User } from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// This function is responsible for getting all User's posts
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    await ConnectDB();
    const payload = await getCurrentUser(req);
    if (!payload)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    const isUserExist = await User.findById(userId);
    if (!isUserExist)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );

    // const posts = await Post.find({
    //             owner : userId
    //         }).populate({
    //             path : "owner",
    //             select : "username fullName avatar"
    //         })

    const posts = await Post.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort : { createdAt : -1 }
      },
      {
        $lookup: {
          from: "users", // ✅ actual collection name
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
        $lookup: {
          from: "likes", // ✅ actual collection name
          localField: "_id",
          foreignField: "post",
          as: "likesCount",
        },
      },
      {
        $lookup : {
          from : "dislikes",
          localField : "_id",
          foreignField : "post",
          as : "disLikesCount"
        }
      },
      {
        $addFields: {

          isDisLiked : {
            $cond : {
              if : { $in : [new mongoose.Types.ObjectId(payload._id as string),"$disLikesCount.disLikedBy"]},
              then : true,
              else : false
            }
          },
          disLikesCount : { $size : "$disLikesCount"},
          isLiked: {
            $cond: {
              if: {
                $in: [
                  new mongoose.Types.ObjectId(payload._id as string),
                  "$likesCount.likedBy",
                ],
              },
              then: true,
              else: false,
            },
          },
          likesCount: { $size: "$likesCount" }, // ✅ moved out
        },
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    ]);

    if (posts.length === 0)
      return NextResponse.json(
        { success: true, message: "No post found" },
        { status: 200 }
      );

    return NextResponse.json(
      { success: true, data: posts, message: "Posts fetched successfully" },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      {
        status: 500,
      }
    );
  }
}
