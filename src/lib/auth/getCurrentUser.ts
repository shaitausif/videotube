import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";


export const getCurrentUser = async(req: NextRequest) => {
    const customJWTToken = req.cookies.get("accessToken")?.value
    const nextAuthToken =  getToken({req, secret : process.env.NEXTAUTH_SECRET})

    try {
        if(!!customJWTToken){
            const { payload } = await jwtVerify(customJWTToken,new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET))
        return payload as {_id : string, email: string, username: string, fullName: string}
        }else if(!!nextAuthToken)  return nextAuthToken
        
        return null

    } catch (error) {
        return null;
    }

    
}