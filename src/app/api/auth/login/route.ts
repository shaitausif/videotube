import { User } from "@/models/user.model";
import ConnectDB from "@/lib/dbConnect";
import { generateAccessAndRefreshTokens } from "@/lib/server/generateTokens";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest){

    const {identifier, password} = await req.json();

    if(!identifier || !password){
        return NextResponse.json({success : false, message : "All fields are required"},{status : 400})
    }

    await ConnectDB();
    const user = await User.findOne({
        $or : [
            {email : identifier},
            {username : identifier}
        ]
    })

    if(!user) {
        return NextResponse.json({success : false, message: "User not found"},{status : 404})
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        return NextResponse.json({success : false, message : "Incorrect Password"},{status : 400})
    }

    const tokens = await generateAccessAndRefreshTokens(user._id)

    if(!tokens){
        return NextResponse.json({success : false, message : "Failed to generate tokens"},{status : 500})
    }
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }


    const response = NextResponse.json({success : true, message : "User logged in Successfully" },{status : 200})

    response.cookies.set("accessToken",tokens.accessToken, options)
    response.cookies.set("refreshToken", tokens.refreshToken, options)

    return response
}