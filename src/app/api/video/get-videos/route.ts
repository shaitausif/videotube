import { inngest } from "@/inngest/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Video } from "@/models/video.model";
import { normalizeQuery } from "@/utils";
import { NextRequest, NextResponse } from "next/server";


// This controller is responsible for sending the searched videos to the client along with adding the queries in client history and updating the trending searches using Inngest in the background
export async function GET(req: NextRequest){
    try {
        const {payload, cookies} = await getCurrentUser(req)
        const { searchParams } = new URL(req.url)
        const query = searchParams.get("query")?.trim()
        
        if(!query || query == ""){
            return NextResponse.json({success : false, message : "Please provide an appropriate query"}, {status : 400})
        }
     

        if(payload?._id){
   
        await inngest.send({
            name : 'user/search',
            data : {
                query,
                userId : payload._id
            }
        })
        }



        const normalizedQuery = normalizeQuery(query)



        const videos = await Video.find(
            {
                $or : [
                    { title : { $regex : normalizedQuery, $options: "i"}},
                    { description : { $regex : normalizedQuery, $options : "i"}}
                ]
            }
        ).populate({
            path : "owner",
            select : "username fullName avatar"
        })
        
        if(videos.length === 0){
            return NextResponse.json({success : false, message : "No search results found"},{status : 200})
        }

        return NextResponse.json({success : true , message : "Videos fetched successfully", data : videos },{ status : 200 })


    } catch (error) {
        return NextResponse.json({success : false, message : error}, { status : 500 })
    }
}