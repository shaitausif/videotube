import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Like } from "@/models/like.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";



// Controlling for getting liked videos by the currently logged In user
export async function GET(req : NextRequest){
    try {
        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})

        await ConnectDB();
         // Here I will use aggregation pipeline to get all the videos liked by the current logged in user
    const likedVideos = await Like.aggregate([
        // 1st stage
        // It will filter all the Like documents where user id is equal to the current user and video field is not null
        {   
            $match : {
                 likedBy : new mongoose.Types.ObjectId(payload?._id as string),
                 video : {$ne : null}
            }
        },
        // 2nd Stage
        // Join all the documents with video documents with respect to the video document id
        {
            $lookup : {
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "videoInfo",
                pipeline : [
                    // So in this lookup we're actually in the videos document and here we'll join videos document with users document from which the video belongs to means owner
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            // and here in this pipeline we're in the User document
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        avatar : 1,
                                        username : 1    
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                // This owner field will overwrite the owner array with the first object in that array
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    // As map function always returns a new array
    const allLikedVideos = likedVideos.map(Like => Like.videoInfo[0])

    return NextResponse.json({success : true, data : allLikedVideos, message : "Videos fetched successfully."})

    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}