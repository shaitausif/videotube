import { User } from "@/app/models/user.model";
import ConnectDB from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest){
    try {
        const {email, password} = await req.json();
    
        if(!email || !password){
            return NextResponse.json({
                success : false,
                message : "Email and Password is required"
            },{status : 400})
        }
    
        // Connect to DB
        await ConnectDB()
        const user = await User.findOne({email}) 
        if(!user) return NextResponse.json({success : false, message : "User not found"})
    
        user.password = password
        await user.save();
        return NextResponse.json({success : true, message: "Password Changed Successfully"},{status : 200})
        
    } catch (error) {
        return NextResponse.json({success : false, message : `Error: ${error}`})
    }

}