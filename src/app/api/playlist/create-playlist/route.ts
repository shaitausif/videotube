import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Playlist } from "@/models/playlist.model";
import { NextRequest, NextResponse } from "next/server";



// This function is responsible for creating user playlist
export async function POST(req: NextRequest){
    try {
        
        const { name , description } = await req.json();
        if(!name || !description) return NextResponse.json({success : false, message : "Title and Description are required"},{status : 400})

        const payload = await getCurrentUser(req)

        await ConnectDB()
        const playlist = await Playlist.create({
            name,
            description,
            owner : payload?._id
        })
        if(!playlist) return NextResponse.json({success : false, message : "Unable to create playlist"})

        return NextResponse.json({success : true, data : playlist, message : "Playlist created successfully."})
        

    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}