import ConnectDB from "@/lib/dbConnect";
import { Comment } from "@/models/comment.model";
import { NextRequest, NextResponse } from "next/server";
import { PostCommentSchema } from "@/schemas/PostCommentSchema";

// This controller is responsible for updating comments of videos
export async function PATCH(req: NextRequest,
    { params } : { params : { commentId : string } }
){
    try {
        const { commentId } = params
        const { content } = await req.json()
        if(!content) return NextResponse.json({success : false, message : "Content is required"},{status : 400})
        const result = PostCommentSchema.safeParse({comment: content})
        if(!result.success) return NextResponse.json({success : false, message : "Invalid inputs"}, {status : 400})
    
        await ConnectDB();
        const isCommentExist = await Comment.findByIdAndUpdate(
            commentId,
            {
                content,
                isEdited : true
            },
            { new : true }
        )
        if(!isCommentExist) return NextResponse.json({success : false, message : "Comment not found"},{status : 404})
        console.log(isCommentExist)
        return NextResponse.json({success : true, data : isCommentExist, message : "Comment updated successfully"},{status : 200})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}




export async function DELETE(req: NextRequest,
    { params } : { params : {commentId : string} }
){
    try {
        const { commentId } = params
    
        await ConnectDB()
        const isCommentExist = await Comment.findByIdAndDelete(commentId)
        
        if(!isCommentExist) return NextResponse.json({success : false, message : "Comment not found"},{status : 404})
    
        return NextResponse.json({success : true, message : "Comment deleted successfully."},{status : 200})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}