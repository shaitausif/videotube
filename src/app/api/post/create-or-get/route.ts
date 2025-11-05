import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from 'fs/promises'
import { uploadOnCloudinary } from "@/lib/cloudinary";
import { Post } from "@/models/post.models";
import mongoose from "mongoose";


export async function POST(req: NextRequest) {
    try {

        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})


        const data: FormData   = await req.formData()
        const caption = data.get("caption")
        const postImgFile = data.get("postImg") as File

        if(!caption || !postImgFile) return NextResponse.json({
            success : false, 
            message : "Both the fields are required.."
        },{status : 400})

        

        const postImgArrayBuffer = await postImgFile.arrayBuffer();
        const postImgBuffer = Buffer.from(postImgArrayBuffer)
        const postImgFilePath = path.join(
            process.cwd(),
            'public',
            'temp',
            postImgFile.name
        )
        await fs.writeFile(postImgFilePath,postImgBuffer)
        const postImg = await uploadOnCloudinary(postImgFilePath)
        if(!postImg) {
            return NextResponse.json({success : false, message : "Unable to upload the image on cloudinary"},{status : 500})
        }


        await ConnectDB()
        const createPost = Post.create({
            postImg : postImg.url,
            caption,
            owner : payload._id
        })

        if(!createPost){
            return NextResponse.json({success : false, message : "Unabel to create the Post"})
        }

        return NextResponse.json({success : true, data: createPost, message : "Post created successfully."})
        

    } catch (error) {
        return NextResponse.json(
            {
                success : false, 
                message : error
            },{
                status : 500
            }
        )
    }
}



// This controller is responsible for fetching all the posts
export async function GET(req: NextRequest){
    try {
        
        // Connect to the database
        await ConnectDB()
        const posts = await Post.find().populate({
            path : "owner",
            select : "username fullName avatar"
        })

        if(posts.length < 1) {
            return NextResponse.json({
                success : true, 
                message : "No Post found"
            },{
                status : 404
            })
        }

        return NextResponse.json({success : true, data : posts, message : "Posts fetched successfully."},{
            status : 200
        })

    } catch (error) {
        return NextResponse.json({success : false, message : error},{
            status : 500
        })
    }
}