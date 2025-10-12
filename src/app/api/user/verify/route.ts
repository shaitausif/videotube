import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest){
    try {
           const {payload, cookies} = await getCurrentUser(req)
           if(!payload || !payload._id) return NextResponse.json({success : false, valid: false, message : "Unauthorized"},{status : 401})         

            const res =  NextResponse.json({success : true, valid : true, message : "Authorized user"}, {status: 200})
            cookies?.forEach((c) => res.cookies.set(c.name, c.value, c.options))
            return res;


    } catch (error) {
        return NextResponse.json({success : false, message: error}, {status : 500})
    }
}