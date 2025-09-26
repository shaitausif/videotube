import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { UserSearch } from "@/models/usersearch";
import { NextRequest, NextResponse } from "next/server";



// To get the user's search history
export async function GET(req: NextRequest) {   
    try {
        const payload = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "user is not logged in"},{status : 200})

        // Get all the searched queries by this user
        const userSearches = await UserSearch.findOne({
            user : payload._id
        }).select("searches")

        if(!userSearches){
            return NextResponse.json({success : true, message : "No user searches found"},{status : 200})
        }

        console.log(userSearches)
        return NextResponse.json({success : true , message : "user searches fetched successfully.", data : userSearches}, {status : 200})


    } catch (error) {
        return NextResponse.json({success : false, message : error}, {status : 500})
    }
}