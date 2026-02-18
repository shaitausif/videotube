import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";


// Toggle bookmark (save/unsave) a playlist for the current user
export async function POST(req: NextRequest,
    { params }: { params: { playlistId: string } }
) {
    try {
        const { playlistId } = params

        const { payload } = await getCurrentUser(req)
        if (!payload) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        await ConnectDB()

        const user = await User.findById(payload._id)
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

        const isBookmarked = user.bookmarkedPlaylists?.includes(playlistId)

        if (isBookmarked) {
            // Remove bookmark
            await User.findByIdAndUpdate(payload._id, {
                $pull: { bookmarkedPlaylists: playlistId }
            })
            return NextResponse.json({ success: true, data: false, message: "Playlist removed from bookmarks." }, { status: 200 })
        } else {
            // Add bookmark
            await User.findByIdAndUpdate(payload._id, {
                $addToSet: { bookmarkedPlaylists: playlistId }
            })
            return NextResponse.json({ success: true, data: true, message: "Playlist bookmarked successfully." }, { status: 200 })
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 })
    }
}
