import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";


// Get all bookmarked playlists of the current user
export async function GET(req: NextRequest) {
    try {
        const { payload } = await getCurrentUser(req)
        if (!payload) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        await ConnectDB()

        const user = await User.findById(payload._id)
            .populate({
                path: "bookmarkedPlaylists",
                populate: [
                    {
                        path: "owner",
                        select: "username avatar fullName"
                    },
                    {
                        path: "videos",
                        populate: {
                            path: "owner",
                            select: "username avatar fullName"
                        }
                    }
                ]
            })

        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

        // Filter out null entries (in case a bookmarked playlist was deleted)
        const bookmarkedPlaylists = (user.bookmarkedPlaylists || []).filter(Boolean)

        return NextResponse.json({ success: true, data: bookmarkedPlaylists, message: "Bookmarked playlists fetched." }, { status: 200 })

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 })
    }
}
