import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Like } from "@/models/like.model";
import { NextRequest, NextResponse } from "next/server";



// This controller is for toggling likes on the tweet
export async function POST(req : NextRequest,
    { params } : { params : { tweetId : string } }
){
    try {
        const { tweetId } = params
        const payload = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 400})
        await ConnectDB()
        const isTweetLiked = await Like.findOne({
            tweet : tweetId,
            likedBy : payload?._id
        })
        if(!isTweetLiked){
            const likeTweet = await Like.create({
                tweet : tweetId,
                likedBy : payload?._id
            })
            if(!likeTweet) return NextResponse.json({success : false, message : "Unable to like the tweet"},{status : 400})
            
            return NextResponse.json({success : true, data : true, messsage : "Tweet Liked successfully."})
        }
    
        const { deletedCount } = await isTweetLiked.deleteOne()
        if(deletedCount !== 1 ) return NextResponse.json({success : false, message : "Unable to dislike the Tweet"})
    
        return NextResponse.json({success : true, data : false, message : "Tweet disliked successfully."},{status : 200})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }

}