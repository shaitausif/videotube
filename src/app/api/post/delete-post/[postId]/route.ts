import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import ConnectDB from "@/lib/dbConnect";
import { Post } from "@/models/post.models";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest,
    { params } : { params : { postId : string } }
) {
    try {
        const { postId } = params        
        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"}, { status : 401 } )

        await ConnectDB()

        const isPostExist = await Post.findOne({
            _id : new mongoose.Types.ObjectId(postId),
            owner : payload?._id
        })

        const result = await isPostExist.deleteOne()
        if(result.deletedCount == 0){
            return NextResponse.json({success : false, message : "Can't delete the post"},{status : 500})
        }


        if(!isPostExist) return NextResponse.json({success : false, message : "Post doesn't exist"},{status : 404})

        // Now Delete the post from cloudinary as well
        const isPostDeleted = await deleteFromCloudinary(isPostExist.postImg)
        if(isPostDeleted.result !== 'ok'){
            return NextResponse.json({success : false, message : "Unable to delete the post image from cloudinary."}, {status : 500})
        }
        console.log(isPostDeleted)

        return NextResponse.json({success : true, message : "Post Deleted successfully."})

    } catch (error) {
        return NextResponse.json({success : false, message : error},{
            status : 500
        })
    }
}



