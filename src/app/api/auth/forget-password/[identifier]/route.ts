import { User } from "@/app/models/user.model";
import ConnectDB from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "../../../../../../helpers/SendVerificationEmail";

export async function GET(req: NextRequest,{params}: {params: {identifier: string}}){
    try {
        const {identifier} = params

        // Connect to the DB
        await ConnectDB()
        const user = await User.findOne({
            $or : [
                {email: identifier},
                {username : identifier}
            ]
        })

        if(!user){
            return NextResponse.json({
                success : false, 
                message : "User not found"
            },{status : 404})
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verifyCode = verificationCode
        user.VerifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000)
        await user.save({validateBeforeSave: false})

        const emailResponse = await sendVerificationEmail(user.email,user.username,verificationCode)

        if(!emailResponse.success){
            return NextResponse.json({success : false, message : emailResponse.message},{status : 400})
        }
        console.log("Email Response", emailResponse)

        return NextResponse.json({
            success : true ,
            email : user.email,
            message : "OTP Sent Successfully"
        },{status : 200})


    } catch (error) {
        return NextResponse.json({success : false, message: error},{status : 500})
    }
}