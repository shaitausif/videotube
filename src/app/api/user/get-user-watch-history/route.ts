import { User } from "@/models/user.model";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req : NextRequest){

    try {
        const payload = await getCurrentUser(req)

    if(!payload || !payload._id){
        return NextResponse.json({success : false, message : "Unauthorized"},{status : 400})
    }

    await ConnectDB()
    const isUserExist = await User.findById({_id: payload._id})
    if(!isUserExist){
        return NextResponse.json({success : false, message: "User not found"},{status : 404})
    }

    const user = await User.aggregate([
        // 1st Stage
        {
            // if we're using aggregation pipeline then we have to use it something like this: _id : new mongoose.Types.ObjectId(req.user._id) because now the data goes directly when we use aggregation pipeline
            $match : {_id : new mongoose.Types.ObjectId(payload._id as string)}
        },
        // 2nd Stage
        {
            // So in this lookup we're getting all the videos documents whose id is present in our watchHistory field of user document 
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                        // So in this lookup we're actually in the videos document and here we'll join videos document with users document from which the video belongs to means owner
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    // Only these fields will going to be in the owner field of the each video document
                                    $project : {
                                        fullName : 1,
                                        username : 1,
                                        avatar : 1
                                    }   
                                }
                            ]
                        }
                    },

                    {
                        // so till here we've a owner field in the videos with the given fields as projected above so now as we're going to get an array so just to make the front-end work easier we should only store the first object in the owner field from that array so for that
                        $addFields : {
                            // this will overwrite the owner field
                            owner : {
                                // this first operator will select the first object from the owner array
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }


    ])


    return NextResponse.json({success : true, data : user[0].watchHistory , message : "Watch History fetched successfully"},{status : 200    })
    } catch (error) {
        return NextResponse.json({success : false, error},{status : 500})
    }

}