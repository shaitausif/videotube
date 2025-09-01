import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// This function is responsible for logging out the user when they login using oauth providers so this function will basically clear the custom cookies set by me for them to access the chat page which requires accessToken because I am not in mood to edit the chat backend's middleware
export async function PUT(req: NextRequest){
    try {
        // const payload = await getCurrentUser(req)
        // if(!payload) return NextResponse.json({
        //     success : false,
        //     message : "Unauthorized"
        // }, { status : 401 } )


        // // connect to the DB and verify the User
        // await ConnectDB()
        // const user = await User.findById(payload._id)
        // if(!user) return NextResponse.json({success : false, message : "No user found"},{status : 404})

        const cookieStore = await cookies()

        const options = {
            httpOnly : true,
            secure : false
        }


        cookieStore.set("accessToken","",options)
        cookieStore.set("refreshToken","",options)


        return NextResponse.json({
            success : true,
            message : "User logout successfully"
        }, {status : 200})


    } catch (error) {
        return NextResponse.json({success : false, message : error}, { status : 500 } )
    }
}