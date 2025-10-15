import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Like } from "@/models/like.model";
import { NextRequest, NextResponse } from "next/server";




// This function is resposible for toggling the likes on posts
export async function POST(req: NextRequest,
    { params } : { params : { postId : string} }
) {
    try {
        const { postId } = params
        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({ success : false, message : "Unauthorized"}, { status : 401})

            await ConnectDB()
        const isPostLiked = await Like.findOne(
            {
                post : postId,
                likedBy : payload._id
            }
        )

        if(!isPostLiked) {
            const likePost = await Like.create({
                post : postId,
                likedBy : payload._id
            })
            if(!likePost) return NextResponse.json({success : false, message : "Unable to like the comment"}, { status : 500})

            return NextResponse.json({
                success : true,
                data : true,
                message : "Post Liked Successfully"
            })
        }
        

        const { deletedCount } = await isPostLiked.deleteOne()
        if(deletedCount !== 1) {
            return NextResponse.json({
                success : false, 
                message : "Unable to dislike the post"
            },{status : 500})
        }

        return NextResponse.json({success : true, data : false, message : "Post like removed successfully"},{status : 200})

    } catch (error) {
        return NextResponse.json({success : false, message : error}, { status : 500 } )
    }
}