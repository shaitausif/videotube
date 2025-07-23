import { User } from "@/models/user.model";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(req: NextRequest){
    try {
        const {oldPassword, newPassword} = await req.json();
    if(!oldPassword.trim() || !newPassword.trim()){
        return NextResponse.json({success : false, message: "Passwords are required"})
    }

    const payload = await getCurrentUser(req)
    if(!payload || !payload._id)return NextResponse.json({success : false, message: "Unauthorized"},{status : 401})

    
    await ConnectDB()
    const user = await User.findById({_id : payload?._id})

    if(!user)return NextResponse.json({success : false, message: "User not found"},{status : 404})

    const isCorrectPassword = await user.isPasswordCorrect(oldPassword)

    if(!isCorrectPassword) return NextResponse.json({success : false, message : "Incorrect Password"},{status : 400})

    user.password = newPassword;

    await user.save({validateBeforeSave: false})

    return NextResponse.json({success : true , message : "Password changed successfully"},{status : 200})
    } catch (error) {
        return NextResponse.json({success : false, error },{status : 500})
    }


}