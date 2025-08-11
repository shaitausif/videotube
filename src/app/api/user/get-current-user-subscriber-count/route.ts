import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Subscription } from "@/models/subscription.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";



// This function is responsible for only sending the user's subscriber count
export async function GET(req: NextRequest){
    try {
        const payload = await getCurrentUser(req)
        if(!payload) return NextResponse.json({success : false, message : "Unauthorized"},{status : 401})
        await ConnectDB()
        const subscriber = await Subscription.countDocuments({
            channel : new mongoose.Types.ObjectId(payload._id as string)
        })

        return NextResponse.json({success : true, data : subscriber, message : "Subscriber's fetched successfully."})

    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}