import { Video } from "@/models/video.model";
import ConnectDB from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";



export async function GET(req : NextRequest,
    { params } : { params : { videoId : string } }
){
    try {
        const payload = await getCurrentUser(req)
        if(!payload)return NextResponse.json({success : false, message : "Unaothorized"},{status : 401})
    
        const {videoId} = params
        await ConnectDB();
        const isVideoExist = await Video.findById(videoId)
        if(!isVideoExist) return NextResponse.json({success : false , message : "Video doesn't exist"},{status : 404})
    
        return NextResponse.json({success : true , data : isVideoExist.isPublished , message : "Data fetched successfully"},{status : 200})
    } catch (error) {
        return NextResponse.json({success : false, message : error },{status : 500})
    }

}