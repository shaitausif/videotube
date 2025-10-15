



// This controller is responsible for toggling the dislikes on comments

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Dislike } from "@/models/dislike.models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest,
    { params } :  { params : { commentId : string } }
){
    try {
        const { commentId } = params
        const {payload} = await getCurrentUser(req)

        await ConnectDB()
        const isDislikedComment = await Dislike.findOne({
            comment : commentId,
            disLikedBy : payload?._id
        })

        if(!isDislikedComment){
            const disLikedComment = await Dislike.create({
                comment : commentId,
                disLikedBy : payload?._id
            })

            if(!disLikedComment) return NextResponse.json({success : false, message : "Unable to dislike the comment"},{status : 500})
            return NextResponse.json({success : true, data : true, message : "Comment Disliked successfully."},{status : 200})

        }


        const { deletedCount } = await isDislikedComment.deleteOne()
        if(deletedCount !== 1) return NextResponse.json({success : false, message : "Unable to remove the dislike from comment"})

        return NextResponse.json({success : true, data : false, message : "Dislike removed from comment"})

    } catch (error) {
        return NextResponse.json({success : false, message : error},{ status : 500})
    }
}