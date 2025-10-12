import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req : NextRequest){
    try {
        const  { token } = await req.json()
        const {payload, cookies} = await getCurrentUser(req)
       
        if(!payload) return NextResponse.json({success : false , message : "Unauthorized"}, {status : 401})
        

        await ConnectDB()
        const user = await User.findByIdAndUpdate(
            payload._id,
            {
                // ensures no duplications inside the fcmTokens array
                $addToSet : { fcmTokens : token }
            }
        
        )

        if(!user) return NextResponse.json({success : false, message : "Unable to update the user FCM tokens"}, {status : 200})

        return NextResponse.json({success : true,message : "User tokens updated successfully"})
        

    } catch (error) {
        return NextResponse.json({success : false, message : error}, {status : 500})
    }
}