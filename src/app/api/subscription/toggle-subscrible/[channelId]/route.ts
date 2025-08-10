import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Subscription } from "@/models/subscription.model";
import { NextRequest, NextResponse } from "next/server";



// This function is responsible for toggling subscription of user for a particular channel
export async function POST(req : NextRequest,
    { params } : { params : { channelId : string } }
){
    try {
        const { channelId } = params
        const payload = await getCurrentUser(req)
        await ConnectDB()
        const isSubsbribed = await Subscription.findOne({ channel : channelId , subscriber : payload?._id })
        if(!isSubsbribed) {
            const subscribe = await Subscription.create({
                channel : channelId,
                subscriber : payload?._id
            })
            if(!subscribe) return NextResponse.json({success : false, message : "Unable to subscribe the channel"},{status : 500})
            return NextResponse.json({success : true , data : true , message : "Channel subscribed successfully."})
        }

        const { deletedCount } = await isSubsbribed.deleteOne()
        if(deletedCount !== 1) return NextResponse.json({success : false, message : "Unable to unsubscribe the channel"},{status : 500})
        return NextResponse.json({
            success : true ,
            data : false, 
            message : "Channel Unsubscribed Successfully."
    },{status : 200})
    } catch (error) {
        return NextResponse.json({success : false, message : error},{status : 500})
    }
}