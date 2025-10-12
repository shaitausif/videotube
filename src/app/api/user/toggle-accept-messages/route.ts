import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {
    try {
        const {payload} = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"}, {status : 401})

        await ConnectDB()

        const user = await User.findByIdAndUpdate(
            payload._id,
            [
                { $set : { isAcceptingMessages : { $not : "$isAcceptingMessages"} } }
            ],
            { new : true }
        )

        if(!user) return NextResponse.json({success : false , message : "Unable to update the field"}, { status : 500})
            
        return NextResponse.json({
            success : true, 
            data : user.isAcceptingMessages
        }, {status : 200})

    } catch (error) {
        return NextResponse.json({success : false, message : error}, {status : 500})
    }
}