


//  This controller is responsible for toggling the dislikes on the tweet

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Dislike } from "@/models/dislike.models";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest,
    {params} : { params : { tweetId : string } }
){
    try {
        const { tweetId } = params
        const payload = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"}, {status : 401})
        await ConnectDB()

        const isTweetDisLiked = await Dislike.findOne({
            tweet : tweetId,
            disLikedBy : payload?._id
        })

        if(!isTweetDisLiked){
            const disLikedTweet = await Dislike.create({
                tweet : tweetId,
                disLikedBy : payload._id
            })
            if(!disLikedTweet) return NextResponse.json({success : false ,message : "Unable to dislike the tweet"},{status : 500})
            
                return NextResponse.json({success : true,data : true, message : "Tweet disliked successfully"},{status : 200})
        }


        const { deletedCount } = await isTweetDisLiked.deleteOne()
        if(deletedCount !== 1) return NextResponse.json({success : false, message : "Unable to remove dislike from tweet"}, {status : 500})

        return NextResponse.json({success : true, data : false, message : "Dislike removed from tweet"}, {status : 200})

    
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}