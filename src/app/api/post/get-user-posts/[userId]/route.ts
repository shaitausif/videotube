import ConnectDB from "@/lib/dbConnect";
import { Post } from "@/models/post.models";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";



// This function is responsible for getting all User's posts
export async function GET(req: NextRequest,
    { params } : { params : { userId : string } }
){
    try {
        const { userId } = params

        await ConnectDB()
        
        const isUserExist = await User.findById(userId)
        if(!isUserExist) return NextResponse.json({success : false, message : "User not found"},{status : 404})


        const posts = await Post.find({
                    owner : userId
                }).populate({
                    path : "owner",
                    select : "username fullName avatar"
                })
        
        
                if(posts.length === 0) return NextResponse.json({success : true, message : "No post found"},{status : 200})
        
                return NextResponse.json({success : true, data: posts, message : "Posts fetched successfully"},{
                    status : 200
                })

    } catch (error) {
        return NextResponse.json({success : false, message : error},{
            status : 500
        })
    }
}