import ConnectDB from "@/lib/dbConnect";
import { Playlist } from "@/models/playlist.model";
import { NextRequest, NextResponse } from "next/server";




export async function POST(req : NextRequest,
    { params } : { params : { playlistId : string , videoId : string } }
){
    try {
        const { playlistId , videoId } = params

        await ConnectDB()
        const isPlaylistExist = await Playlist.findById(playlistId)
        if(!isPlaylistExist) return NextResponse.json({success : false, message : "Playlist not found"},{status : 404})

        isPlaylistExist.videos.push(videoId)
        await isPlaylistExist.save()
        
        return NextResponse.json({success : true , data : isPlaylistExist , message : "Video added to the playlist successfully."},{status : 200})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}


// This function is responsible for removing the specific video from a playlist
export async function PATCH(req : NextRequest,
    { params } : { params : { playlistId : string , videoId : string }}
) {
    try {
        const { playlistId, videoId } = params

        await ConnectDB()
        const isPlaylistExist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            // $pull removes videoId from the videos array.
            $pull : {videos : videoId}

        },
        {
            new : true
        }
    )
    if(!isPlaylistExist) return NextResponse.json({success : false ,message : "Playlist not found"},{status : 404})

    return NextResponse.json({success : true, message : "Video removed from playlist successfully."})

    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}