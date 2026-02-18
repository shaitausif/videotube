import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Playlist } from "@/models/playlist.model";
import { NextRequest, NextResponse } from "next/server";




export async function POST(req : NextRequest,
    { params } : { params : { playlistId : string , videoId : string } }
){
    try {
        const { playlistId , videoId } = params

        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})

        await ConnectDB()
        const isPlaylistExist = await Playlist.findById(playlistId)
        if(!isPlaylistExist) return NextResponse.json({success : false, message : "Playlist not found"},{status : 404})
        if(isPlaylistExist.owner.toString() !== payload._id) return NextResponse.json({success : false, message : "You are not authorized to modify this playlist"},{status : 403})

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $addToSet : { videos : videoId } },
            { new : true }
        )
        
        return NextResponse.json({success : true , data : updatedPlaylist , message : "Video added to the playlist successfully."},{status : 200})
    } catch (error : any) {
        return NextResponse.json({success : false, message : error?.message || "Internal server error"},{status : 500})
    }
}


// This function is responsible for removing the specific video from a playlist
export async function PATCH(req : NextRequest,
    { params } : { params : { playlistId : string , videoId : string }}
) {
    try {
        const { playlistId, videoId } = params

        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})

        await ConnectDB()
        const playlist = await Playlist.findById(playlistId)
        if(!playlist) return NextResponse.json({success : false, message : "Playlist not found"},{status : 404})
        if(playlist.owner.toString() !== payload._id) return NextResponse.json({success : false, message : "You are not authorized to modify this playlist"},{status : 403})

        await Playlist.findByIdAndUpdate(
            playlistId,
            {
                // $pull removes videoId from the videos array.
                $pull : {videos : videoId}
            },
            {
                new : true
            }
        )

        return NextResponse.json({success : true, message : "Video removed from playlist successfully."})

    } catch (error : any) {
        return NextResponse.json({success : false, message : error?.message || "Internal server error"},{status : 500})
    }
}