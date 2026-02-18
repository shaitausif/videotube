import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Playlist } from "@/models/playlist.model";
import { NextRequest, NextResponse } from "next/server";



// This function is responsible for creating user playlist
export async function POST(req: NextRequest){
    try {
        
        const { name , description, videos } = await req.json();
        if(!name || !description) return NextResponse.json({success : false, message : "Title and Description are required"},{status : 400})

        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})

        await ConnectDB()
        const playlist = await Playlist.create({
            name,
            description,
            owner : payload._id,
            videos : Array.isArray(videos) ? videos : []
        })
        if(!playlist) return NextResponse.json({success : false, message : "Unable to create playlist"})

        // Populate the created playlist to return full data
        const populatedPlaylist = await Playlist.findById(playlist._id)
            .populate({
                path : "videos",
                populate : {
                    path : "owner",
                    select : "username avatar fullName"
                }
            })
            .populate({
                path : "owner",
                select : "username avatar fullName"
            })

        return NextResponse.json({success : true, data : populatedPlaylist, message : "Playlist created successfully."})
        

    } catch (error : any) {
        return NextResponse.json({success : false, message : error?.message || "Internal server error"},{status : 500})
    }
}