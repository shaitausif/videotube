import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest){
    try {
           const payload = await getCurrentUser(req)
           if(!payload || !payload._id) return NextResponse.json({success : false, valid: false, message : "Unauthorized"},{status : 401})         

            return NextResponse.json({success : true, valid : true, message : "Authorized user"}, {status: 200})


    } catch (error) {
        return NextResponse.json({success : false, message: error}, {status : 500})
    }
}