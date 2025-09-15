import { User } from "@/models/user.model";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest){
    try {
        // Getting these informations from user's token doesn't matter whethere if it is from oauth or credentials
        const payload = await getCurrentUser(req)
    
        if(!payload)return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})
        
        await ConnectDB()
        const user = await User.findOne({_id : payload._id}).select("-password -verifyCode -isVerified -watchHistory -fcmTokens -verifyCodeExpiry")
        if(!user){
            return NextResponse.json({success : false, message : "User not found"},{status : 404})
        }



    
        return NextResponse.json({success : true, data: user, message: "User Information fetched successfully"})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }

}