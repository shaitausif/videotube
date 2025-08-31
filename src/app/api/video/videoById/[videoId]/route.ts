import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Video } from "@/models/video.model";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { deleteFromCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
import ConnectDB from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import mongoose from "mongoose";

// This function is responsible for getting the video by the video ID and appending the video ID in the user's watchHistory document field
export async function GET(
  req: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const payload = await getCurrentUser(req);
    // if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})
    const { videoId } = params;

    await ConnectDB();
    // append the videoId in the user's watchHistory
    const user = await User.findById(payload?._id);
    if (user) {

      if (!user.watchHistory.includes(videoId)) {
        // If User has not watched this video then add it into user's watchHistory 
        user.watchHistory.push(videoId);
        user.save({ validateBeforeSave: false });

        // And also as the user is viewing this video for the first time update the video's views
        const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc : { views : 1 }} // Increment by 1 
      )

      }
      
    }

    // const video = await Video.findById(videoId).populate({
    //     path : "owner",
    //     select : "username fullName avatar"
    // })
   const video = await Video.aggregate([
  {
    $match: {
      _id: new mongoose.Types.ObjectId(videoId),
    },
  },
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: [
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers",
          },
        },
        {
            $addFields : {
                isSubscribed: {
          $cond: {
            // Here we're checking that the current logged in user is present or not in any of the channel's subscribers field
            // Converting the payload._id to mongoose object ID for accurate comparison
            if: { $in: [new mongoose.Types.ObjectId(payload?._id as string), "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
            }
        },
        {
          $addFields: {
            subscribers: { $size: { $ifNull: ["$subscribers", []] } }
          },
        },
        {
          $project: {
            _id: 1,
            fullName: 1,
            username: 1,
            avatar: 1,
            subscribers: 1,
            isSubscribed : 1
          },
        },
      ],
    },
  },
  {
    $lookup : {
      from : "likes",
      localField : "_id",
      foreignField : "video",
      as : "likes"
    },
    
  },
  {
    $addFields : { likes : { $size : "$likes" },
    isLiked : { 
      $cond : {
        if : { $in : [new mongoose.Types.ObjectId(payload?._id as string), "$likes.likedBy"]},
        then : true,
        else : false
      }
    }
  }
  },
  { $unwind: "$owner" },
]);
  


    if (!video)
      return NextResponse.json(
        { success: false, message: "Video don't exist" },
        { status: 404 }
      );

    return NextResponse.json(
      {
        success: true,
        data: video[0],
        message: "Video Data fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}

// Controller for updating the video
export async function PUT(
  req: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const payload = await getCurrentUser(req);
    if (!payload)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const { videoId } = params;
    const { title, description } = await req.json();
    if (!title || !description)
      return NextResponse.json(
        { success: false, message: "Title and Description are required" },
        { status: 400 }
      );

    const data: FormData = await req.formData();
    const thumbnailFile = data.get("thumbnail") as File;
    if (!thumbnailFile)
      return NextResponse.json(
        { success: false, message: "Thumbnail is required" },
        { status: 400 }
      );

    // Connect to the database
    await ConnectDB();
    const isVideoExist = await Video.findById(videoId);
    if (!isVideoExist)
      return NextResponse.json(
        { success: false, message: "Video don't exist" },
        { status: 404 }
      );

    // First delete the old thumbnail from cloudinary
    const oldThumbnail = isVideoExist.thumbnail;
    const isDeleted = await deleteFromCloudinary(oldThumbnail);

    if (isDeleted.result !== "ok")
      return NextResponse.json({
        success: false,
        message: "Unable to delete the Old thumbnail",
      });

    const thumbnailFileArrayBuffer = await thumbnailFile.arrayBuffer();
    const thumbnailFileBuffer = Buffer.from(thumbnailFileArrayBuffer);
    const thumbnailFilePath = path.join(
      process.cwd(),
      "public",
      "temp",
      thumbnailFile.name
    );
    await fs.writeFile(thumbnailFilePath, thumbnailFileBuffer);

    // Now, as the video has been set locally now i will upload it on cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailFilePath);
    if (!thumbnail)
      return NextResponse.json(
        { success: false, message: "Failed to upload thumbnail on cloudinary" },
        { status: 500 }
      );

    isVideoExist.title = title;
    isVideoExist.description = description;
    isVideoExist.thumbnail = thumbnail.url;
    await isVideoExist.save({ validateBeforeSave: false });

    return NextResponse.json(
      {
        success: true,
        data: isVideoExist,
        message: "Video updated successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}

// For Deleting the videos
export async function DELETE(
  req: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const payload = await getCurrentUser(req);
    if (!payload)
      return NextResponse.json(
        { success: false, message: "Unaothorized" },
        { status: 401 }
      );

    const { videoId } = params;
    await ConnectDB();
    const isVideoExist = await Video.findByIdAndDelete(videoId);
    if (!isVideoExist)
      return NextResponse.json({
        success: false,
        message: "Video doesn't exist",
      });

    
    const isThumbnailDeleted = await deleteFromCloudinary(isVideoExist.thumbnail)
    const isVideoDeleted = await deleteFromCloudinary(isVideoExist.videoFile)

    console.log(isVideoDeleted)
    console.log(isThumbnailDeleted)

    if(isThumbnailDeleted.result !== 'ok' || isVideoDeleted.result !== 'ok'){
      return NextResponse.json({
        success : false,
        message : "Unable to delete the video from cloudinary"
      })
    }


    return NextResponse.json(
      { success: true, message: "Video Deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}

// For Toggling the VideoPublish Status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const payload = await getCurrentUser(req);
    if (!payload)
      return NextResponse.json(
        { success: false, message: "Unaothorized" },
        { status: 401 }
      );
    const { videoId } = params;
    const { isPublished } = await req.json();

    await ConnectDB();
    const isVideoExist = await Video.findByIdAndUpdate(
      videoId,
      {
        isPublished,
      },
      { new: true }
    );
    if (!isVideoExist)
      return NextResponse.json(
        { success: false, message: "Video doesn't exist" },
        { status: 400 }
      );

    return NextResponse.json({
      success: true,
      data: isVideoExist.isPublished,
      message: "Publish Status Updated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
