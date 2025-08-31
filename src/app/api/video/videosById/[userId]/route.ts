import ConnectDB from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { Video } from "@/models/video.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";



// this controller is to get all the videos of a particular user   
export async function GET(req: NextRequest,
    { params } : { params : { userId : string} }
){
    try {
        const { userId } = params
        
        await ConnectDB()
        const isUserExist = await User.findById(userId)
        if(!isUserExist) return NextResponse.json({success : false , message : "User not found"},{status : 404})

        const videos = await Video.find({
            owner : new mongoose.Types.ObjectId(userId)
        })

        if(videos.length === 0) return NextResponse.json({success : true,data : [], message : "No Videos Found"},{status : 200})

        return NextResponse.json({success : true, data: videos, message : "Videos fetched successfully"},{status : 200})

    } catch (error) {
        console.log(error)
        return NextResponse.json({success : false, message : "Error occurred"},{status : 500})
    }
}