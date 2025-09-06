import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Dislike } from "@/models/dislike.models";
import { NextRequest, NextResponse } from "next/server";




// This function is resposible for toggling the dislikes on posts
export async function POST(req: NextRequest,
    { params } : { params : { postId : string} }
) {
    try {
        const { postId } = params
        const payload = await getCurrentUser(req)
        if(!payload) return NextResponse.json({ success : false, message : "Unauthorized"}, { status : 401})

            await ConnectDB()
        const isPostDisLiked = await Dislike.findOne(
            {
                post : postId,
                disLikedBy : payload._id
            }
        )

        if(!isPostDisLiked) {
            const likePost = await Dislike.create({
                post : postId,
                disLikedBy : payload._id
            })
            if(!likePost) return NextResponse.json({success : false, message : "Unable to dislike the comment"}, { status : 500})

            return NextResponse.json({
                success : true,
                data : true,
                message : "Post Disliked Successfully"
            })
        }
        

        const { deletedCount } = await isPostDisLiked.deleteOne()
        if(deletedCount !== 1) {
            return NextResponse.json({
                success : false, 
                message : "Unable to dislike the post"
            },{status : 500})
        }

        return NextResponse.json({success : true, data : false, message : "Post Dislike removed successfully"},{status : 200})

    } catch (error) {
        return NextResponse.json({success : false, message : error}, { status : 500 } )
    }
}