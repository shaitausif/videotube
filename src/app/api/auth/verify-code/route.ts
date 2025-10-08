import { User } from "@/models/user.model";
import ConnectDB from "@/lib/dbConnect";
import { generateAccessAndRefreshTokens } from "@/lib/server/generateTokens";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req : NextRequest){
    try {
        const {email, code} = await req.json();
    
        // Decode URI
        await ConnectDB();
        const user = await User.findOne({email})
    
        if(!user){
            return NextResponse.json({success : false, message : "User not found"}, {status : 404})
        }
    
        const isCodeValid = user.verifyCode === code
    
        const isCodeNotExpired = new Date(user.VerifyCodeExpiry) > new Date()
        console.log(isCodeNotExpired,isCodeValid)
        if(isCodeValid && isCodeNotExpired){
            // Making this field undefined so that TTL will not delete this user document
            user.VerifyCodeExpiry = undefined
            user.isVerified = true
            await user.save();
            const response =  NextResponse.json({success : true, message : "User Verified Successfully"})

            const options = {
            httpOnly: true,
            secure : false,
            maxAge : 7 * 24 * 60 * 60 // For example, 7 days
        }

        const tokens = await generateAccessAndRefreshTokens(user._id)

        if(!tokens){
            return NextResponse.json({success : false, message : "Unable to generate the tokens"})
        }


        response.cookies.set("accessToken", tokens.accessToken,options)
        response.cookies.set("refreshToken", tokens.refreshToken, options)
        
        return response
        }
        
        
        return NextResponse.json({success : false, message : "The Verification code is Invalid or has been Expired"},{status : 400})

        
    } catch (error) {
        return NextResponse.json({success : false, message : `Error in Verifying the code: ${error}`},{status : 500})
    }

}