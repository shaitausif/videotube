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

    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}



export async function PATCH(req : NextRequest,
    { params } : { params : { playlistId : string } }
){
    try {
        const { playlistId } = params

        const { name, description } = await req.json()
        if(!name || !description) return NextResponse.json({success : false, message : "Name and Desciption are required"},{status : 400})

        await ConnectDB();
        const isPlaylistExist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                name,
                description
            },
            { new : true }
        )
        if(!isPlaylistExist) return NextResponse.json({success : false, message : "Playlist not found"},{status : 404})
        
        return NextResponse.json({success : true , message : "Playlist updated successfully."},{status : 200})

    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}



// This function is responsible for deleting the playlist
export async function DELETE(req : NextRequest,
    { params } : { params : { playlistId : string } }
){
    try {
        const { playlistId } = params
        await ConnectDB();
        const isPlaylistExist = await Playlist.findByIdAndDelete(playlistId)

        if(!isPlaylistExist) return NextResponse.json({success : false, message : "Playlist not found"},{status : 404})

        return NextResponse.json({success : true, message : "Playlist deleted successfully."},{status : 200})

    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}