import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Like } from "@/models/like.model";
import { NextRequest, NextResponse } from "next/server";



// This controller is for toggling likes on the video
export async function POST(req: NextRequest,
    { params } : { params : { videoId : string } }
) {
    try {
        const { videoId } = params
        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})
        // Connect to the database
        await ConnectDB()
        const isLiked = await Like.findOne({
            video : videoId,
            likedBy : payload._id
        })
        if(!isLiked){
            const likedVideo = await Like.create({
                video : videoId,
                likedBy : payload._id
            })
            if(!likedVideo) return NextResponse.json({success : false, message : "Unable to like the video"})
            return NextResponse.json({success : true, data : true, message : "Video liked successfully."})
        }
    
        const { deletedCount } = await isLiked.deleteOne()
        if(deletedCount !== 1 ) return NextResponse.json({success : false, message : "Unable to dislike the video"})
        
        return NextResponse.json({success : true, data : false , message : "Video like removed successfully."})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}