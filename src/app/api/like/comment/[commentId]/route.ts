import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Like } from "@/models/like.model";
import { NextRequest, NextResponse } from "next/server";



// This controller is for toggling likes on comments
export async function POST(req: NextRequest,
    { params } : { params : { commentId : string } }
){
    try {
        const { commentId } = params
        const payload = await getCurrentUser(req)
        await ConnectDB()
        const isLikedComment = await Like.findOne({
            comment : commentId,
            likedBy : payload?._id
        })
    
        if(!isLikedComment){
            const likeComment = await Like.create({
                comment : commentId,
                likedBy : payload?._id
            })
    
            if(!likeComment) return NextResponse.json({success : false, message : "Unable to like the Comment"},{status : 500})
            return NextResponse.json({success : true, data : true, message : "Comment Liked Successfully."})
        }
    
        const { deletedCount } = await isLikedComment.deleteOne()
        if(deletedCount !== 1) return NextResponse.json({success : false, message : "Unable to dislike the comment"},{status : 500})
    
        return NextResponse.json({success : true, data : false, message : "Comment like removed successfully."})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}