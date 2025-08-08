import { NextRequest, NextResponse } from "next/server";
import { Video } from "@/models/video.model";
import ConnectDB from "@/lib/dbConnect";
import fs from 'fs/promises'
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import path from "path";
import { uploadOnCloudinary } from "@/lib/cloudinary";





export async function GET(req: NextRequest){
    try {
        await ConnectDB(); // Establish database connection

    // Extract query parameters with explicit type casting
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);
    const query = searchParams.get('query') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortType = searchParams.get('sortType') || 'desc';    
    const userId = searchParams.get('userId') || '';

    // Create a filter object for MongoDB query
    const filter: any = {};

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
        ];
    }

    if (userId) {
        filter.owner = userId;
    }

    // Prepare sort options
    const sortOptions: { [key: string]: 1 | -1 } = {};
    sortOptions[sortBy] = sortType === 'asc' ? 1 : -1;

    // Calculate the number of documents to skip for pagination
    const skip = (page - 1) * limit;

    // Use Promise.all to fetch videos and total count concurrently
    const [videos, total] = await Promise.all([
        Video.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .exec(), // Use .exec() for a proper Promise from Mongoose
        Video.countDocuments(filter),
    ]);

    // Return the response using Next.js's NextResponse
    return NextResponse.json({
        success : true,
        data : {
            videos,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit)
        }
        },
        message : "Videos fetched successfully"
    },{status : 200})
        
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}



export async function POST(req: NextRequest){
    try {
        const {title , description} = await req.json()

        if(!title || !description) return NextResponse.json({success : false, message : "Title and Description are required"},{status : 400})

        // Verifying user tokens
        const payload = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})

        const data: FormData = await req.formData()

        if(!data) return NextResponse.json({success : false, message : "Data is required"},{status : 400})

        const videoFile = data.get("videoFile") as File
        if(!videoFile) return NextResponse.json({success : false, message : "Video is required"},{status : 400})

        const thumbnailFile = data.get("thumbnail") as File
        if(!thumbnailFile) return NextResponse.json({success : false, message : "Thumbnail is required"},{status : 400})

        const videoFileArrayBuffer = await videoFile.arrayBuffer()
        const videoFileBuffer = Buffer.from(videoFileArrayBuffer)
        const videoFilePath = path.join(
            process.cwd(),
            "public",
            "temp",
            videoFile.name
        )
        await fs.writeFile(videoFilePath,videoFileBuffer)
        // Now, Uploading video on the cloudinary
        const video = await uploadOnCloudinary(videoFilePath)
        if(!video) return NextResponse.json({success : false, message : "Failed to upload video on cloudinary"},{status : 500})

        const thumbnailFileArrayBuffer = await thumbnailFile.arrayBuffer()
        const thumbnailFileBuffer = Buffer.from(thumbnailFileArrayBuffer)
        const thumbnailFilePath = path.join(
            process.cwd(),
            "public",
            "temp",
            thumbnailFile.name
        )
        await fs.writeFile(thumbnailFilePath, thumbnailFileBuffer)

        const thumbnail = await uploadOnCloudinary(thumbnailFilePath)
        if(!thumbnail) return NextResponse.json({success : false, message : "Failed to upload thumbnail on cloudinary"},{status : 500})

        // As i got everything now i can set the values of it in the database
        await ConnectDB()
        const newVideo = await Video.create({
            title,
            description,
            videoFile : video.url,
            thumbnail : thumbnail.url,
            owner : payload._id,
            duration : video.duration
        })

        return NextResponse.json({success : true, data : newVideo , message : "Video Published successfully"},{status : 200})

    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}  



