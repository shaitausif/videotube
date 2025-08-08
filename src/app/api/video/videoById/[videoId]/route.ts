import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Video } from "@/models/video.model";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from 'fs/promises'
import { deleteFromCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
import ConnectDB from "@/lib/dbConnect";




export async function GET(req : NextRequest,
    { params } : { params : { videoId : string }}
){
    try {
        const payload = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})
        const { videoId } = params 
        
        const isVideoExist = await Video.findById(videoId)
        if(!isVideoExist)return NextResponse.json({success : false, message : "Video don't exist"},{status : 404})

        return NextResponse.json({success : true, data : isVideoExist , message : "Video Data fetched successfully"},{status : 200})
        
    } catch (error) {
        return NextResponse.json({success : false , message : error},{status : 500})
    }
}   


// Controller for updating the video
export async function PUT(req : NextRequest,
    { params } : { params : { videoId : string }}
){
    try {
        const payload = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false , message : "Unauthorized"},{status : 401})

        const {videoId} = params
        const { title , description } = await req.json();
        if(!title || !description ) return NextResponse.json({success : false, message : "Title and Description are required"},{status : 400})

        const data: FormData = await req.formData()
        const thumbnailFile = data.get("thumbnail") as File
        if(!thumbnailFile) return NextResponse.json({success : false , message : "Thumbnail is required"},{status : 400})


        // Connect to the database
        await ConnectDB()
        const isVideoExist = await Video.findById(videoId) 
        if(!isVideoExist) return NextResponse.json({success : false, message : "Video don't exist"},{status : 404})

            // First delete the old thumbnail from cloudinary
        const oldThumbnail = isVideoExist.thumbnail
        const isDeleted = await deleteFromCloudinary(oldThumbnail)

        if(isDeleted.result !== "ok") return NextResponse.json({success : false, message : "Unable to delete the Old thumbnail"})

        const thumbnailFileArrayBuffer = await thumbnailFile.arrayBuffer()
        const thumbnailFileBuffer = Buffer.from(thumbnailFileArrayBuffer)
        const thumbnailFilePath = path.join(
            process.cwd(),
            "public",
            "temp",
            thumbnailFile.name
        )
        await fs.writeFile(thumbnailFilePath , thumbnailFileBuffer)

        // Now, as the video has been set locally now i will upload it on cloudinary
        const thumbnail = await uploadOnCloudinary(thumbnailFilePath)
        if(!thumbnail) return NextResponse.json({success : false, message : "Failed to upload thumbnail on cloudinary"},{status : 500})
        
        isVideoExist.title = title
        isVideoExist.description = description
        isVideoExist.thumbnail = thumbnail.url
        await isVideoExist.save({validateBeforeSave : false})

        return NextResponse.json({success : true , data : isVideoExist , message : "Video updated successfully"},{status : 201})
        

    } catch (error) {
        return NextResponse.json({success : false , message : error},{status : 500})
    }
}

// For Deleting the videos
export async function DELETE(req : NextRequest,
    { params } : { params : { videoId : string } }
){
    try {
        const payload = await getCurrentUser(req)
        if(!payload)return NextResponse.json({success : false, message : "Unaothorized"},{status : 401})
    
        const {videoId} = params
        await ConnectDB()
        const isVideoExist = await Video.findByIdAndDelete(videoId)
        if(!isVideoExist) return NextResponse.json({success : false, message : "Video doesn't exist"})
    
         return NextResponse.json({success : true, message : "Video Deleted successfully"},{status : 200}) 
    } catch (error) {
        return NextResponse.json({success : false, message : error },{status : 500})
    }  
}


// For Toggling the VideoPublish Status
export async function PATCH(req : NextRequest,
    { params } : { params : { videoId : string } }
){
    try {
        const payload = await getCurrentUser(req)
        if(!payload)return NextResponse.json({success : false, message : "Unaothorized"},{status : 401})
        const { videoId } = params  
        const { isPublished } = await req.json()

        await ConnectDB()
        const isVideoExist = await Video.findByIdAndUpdate(
            videoId,
            {
                isPublished
            },
            {new : true}
        )
        if(!isVideoExist) return NextResponse.json({success : false , message : "Video doesn't exist"},{status : 400})

        return NextResponse.json({success : true, data : isVideoExist.isPublished , message : "Publish Status Updated successfully."})

    } catch (error) {
        return NextResponse.json({success : false, message : error },{status : 500})
    }
}