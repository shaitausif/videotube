import { User } from "@/app/models/user.model"
import { clsx, type ClassValue } from "clsx"
import mongoose from "mongoose"
import { NextResponse } from "next/server"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const generateAccessAndRefreshTokens = async(userId: mongoose.Types.ObjectId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()

        // Here we've successfully generated both access and refresh tokens and now we'll give the access token to the user and also store the refresh token in the database
        user.refreshToken = refreshToken; 
        // here we don't want any further mongoose validation like password is required so we'll save it like this
        await user.save({validateBeforeSave: false})

        // now return the access token and refresh token
        const tokens = {accessToken, refreshToken}  
        return tokens

    } catch (error) {
        NextResponse.json({success : false, message : "Something went wront while generating access and refresh tokens"},{status : 500})
    }
}
