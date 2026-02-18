import ConnectDB from "@/lib/dbConnect";
import { Playlist } from "@/models/playlist.model";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";



// This function is responsible for getting a specific user's playlists
export async function GET(req : NextRequest,
    { params } : { params : { userId : string } }
){
    try {
        const {userId} = params

        await ConnectDB()
        const isUserExist = await User.findById(userId)
        if(!isUserExist) return NextResponse.json({success : false, message : "User not found"},{ status : 404 })

        const playlists = await Playlist.find(
            {owner : userId}
        ).populate({
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

        return NextResponse.json({success : true, data : playlists, message : "Playlists fetched successfully."},{status : 200})

    } catch (error : any) {
        return NextResponse.json({success : false, message : error?.message || "Internal server error"},{status : 500})
    }
}
