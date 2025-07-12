import { User } from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest){

    const {identifier, password} = await req.json();

    if(!identifier || !password){
        return NextResponse.json({success : false, message : "All fields are required"},{status : 400})
    }

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

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    if(!accessToken || !refreshToken){
        return NextResponse.json({success : false, message : "Failed to generate tokens"},{status : 500})
    }

    user.refreshToken = refreshToken;
    user.save({validateBeforeSave: false})

    
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }


    const response = NextResponse.json({success : true,data : loggedInUser, message : "User logged in Successfully" },{status : 200})

    response.cookies.set("accessToken",accessToken, options)
    response.cookies.set("refreshToken", refreshToken, options)

    return response
}