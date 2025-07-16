import { User } from "@/app/models/user.model";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { signOut } from "next-auth/react";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";


export async function PUT(req: NextRequest){
    try {
        const payload = await getCurrentUser(req)
        if(!payload){
            return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})
        }

        // Connect to DB and search for the User and delete the refreshToken from user's document
        await ConnectDB()
        const user = await User.findById({_id: payload._id})
        
        if(!user) return NextResponse.json({success : false, message: "User not found"},{status : 404})
        
        user.refreshToken = ""
        await user.save()

        const cookieStore = await cookies()

          const options = {
            httpOnly: true,
            secure : true
        }
        signOut
        cookieStore.set("accessToken","",options)
        cookieStore.set("refreshToken","",options)

        return NextResponse.json({success: true, message: "Logged out Successfully"})

    } catch (error) {
        return NextResponse.json({success: false,message: error},{status : 500})
    }
}