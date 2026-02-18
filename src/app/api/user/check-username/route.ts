import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

// Check if a username is available (excluding the current user)
export async function GET(req: NextRequest) {
    try {
        const { payload } = await getCurrentUser(req)
        if (!payload) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        const username = req.nextUrl.searchParams.get("username")?.toLowerCase().trim()
        if (!username) {
            return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 })
        }

        if (username.length < 3) {
            return NextResponse.json({ success: false, available: false, message: "Username must be at least 3 characters" }, { status: 200 })
        }

        if (!/^[a-z0-9_]+$/.test(username)) {
            return NextResponse.json({ success: false, available: false, message: "Username can only contain lowercase letters, numbers, and underscores" }, { status: 200 })
        }

        await ConnectDB()

        const existingUser = await User.findOne({ username, _id: { $ne: payload._id } }).select("_id").lean()

        return NextResponse.json({
            success: true,
            available: !existingUser,
            message: existingUser ? "Username already exists" : "Username doesn't exist, you're good to go!"
        }, { status: 200 })

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 })
    }
}
