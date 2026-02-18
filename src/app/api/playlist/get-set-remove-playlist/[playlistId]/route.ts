import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Playlist } from "@/models/playlist.model";
import { NextRequest, NextResponse } from "next/server";



// This function is responsible for Getting the playlist by ID
export async function GET(req : NextRequest,
    { params } : { params : { playlistId : string } }
){
    try {
        const { playlistId } = params

        await ConnectDB();
        const playlist = await Playlist.findById(playlistId).populate({
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

        if(!playlist) return NextResponse.json({success : false, message : "Playlist not found"},{status : 404})    

        return NextResponse.json({success : true, data : playlist , message : "Playlist fetched successfully."},{status : 200})

    } catch (error : any) {
        return NextResponse.json({success : false, message : error?.message || "Internal server error"},{status : 500})
    }
}



export async function PATCH(req : NextRequest,
    { params } : { params : { playlistId : string } }
){
    try {
        const { playlistId } = params

        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})

        const { name, description } = await req.json()
        if(!name || !description) return NextResponse.json({success : false, message : "Name and Desciption are required"},{status : 400})

        await ConnectDB();
        const playlist = await Playlist.findById(playlistId)
        if(!playlist) return NextResponse.json({success : false, message : "Playlist not found"},{status : 404})
        if(playlist.owner.toString() !== payload._id) return NextResponse.json({success : false, message : "You are not authorized to update this playlist"},{status : 403})

        playlist.name = name
        playlist.description = description
        await playlist.save()
        
        return NextResponse.json({success : true , message : "Playlist updated successfully."},{status : 200})

    } catch (error : any) {
        return NextResponse.json({success : false, message : error?.message || "Internal server error"},{status : 500})
    }
}



// This function is responsible for deleting the playlist
export async function DELETE(req : NextRequest,
    { params } : { params : { playlistId : string } }
){
    try {
        const { playlistId } = params

        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})

        await ConnectDB();
        const playlist = await Playlist.findById(playlistId)
        if(!playlist) return NextResponse.json({success : false, message : "Playlist not found"},{status : 404})
        if(playlist.owner.toString() !== payload._id) return NextResponse.json({success : false, message : "You are not authorized to delete this playlist"},{status : 403})

        await Playlist.findByIdAndDelete(playlistId)

        return NextResponse.json({success : true, message : "Playlist deleted successfully."},{status : 200})

    } catch (error : any) {
        return NextResponse.json({success : false, message : error?.message || "Internal server error"},{status : 500})
    }
}