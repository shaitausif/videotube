import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Comment } from "@/models/comment.model";
import { Video } from "@/models/video.model";
import { NextRequest, NextResponse } from "next/server";


// This controller is for posting comments on videos
export async function POST(req : NextRequest,
    { params }: { params: { videoId: string } }
){
    try {
        const payload = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})
        const { videoId } = params
        const { content } = await req.json()
        if(!content) return NextResponse.json({success : false, message : "Content is required"},{ status : 400 })
        
        await ConnectDB();
        const isVideoExist = await Video.findById(videoId)
        if(!isVideoExist) return NextResponse.json({success : false, message : "Video doesn't exist"},{status : 404})
    
        const comment = await Comment.create({
            content,
            video : videoId,
            owner : payload._id
        })
        if(!comment) return NextResponse.json({success : false, message : "Unable to comment"},{status : 500})
    
        return NextResponse.json({success : true , data : comment, message : "Comment added successfully"},{status : 200})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}



// This controller is for getting comments for a video
export  async function GET(req : NextRequest,
    { params }: { params: { videoId: string } }
) {
   try {
     const { videoId } = params
     const { searchParams } = new URL(req.url)
     const page = searchParams.get("page")
     const limit: any = searchParams.get("limit")
     const skip = (Number(page) -1 * Number(limit))
 
     const filter: any = {}
     if(videoId){
         filter.video = videoId
     }
 
 
     await ConnectDB()
     const [ comments , total ] = await Promise.all([
         Comment.find(filter)
         .skip(skip)
         .limit(limit),
         Comment.countDocuments(filter)
     ])
     
     return NextResponse.json({success : true, data : {comments, total} , message : "Comments fetched successfully."},{status : 200})
   } catch (error) {
    return NextResponse.json({success : false, message : error},{status : 500})
   }
}