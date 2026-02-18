import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";


// Update user profile details (fullName, username, bio, socialLinks)
export async function PATCH(req: NextRequest) {
    try {
        const { payload } = await getCurrentUser(req)
        if (!payload) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { fullName, username, bio, socialLinks } = body

        await ConnectDB()

        const user = await User.findById(payload._id)
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

        // If username is being changed, check for uniqueness
        if (username && username !== user.username) {
            const trimmedUsername = username.toLowerCase().trim()
            if (trimmedUsername.length < 3) {
                return NextResponse.json({ success: false, message: "Username must be at least 3 characters" }, { status: 400 })
            }
            if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
                return NextResponse.json({ success: false, message: "Username can only contain lowercase letters, numbers, and underscores" }, { status: 400 })
            }
            const existingUser = await User.findOne({ username: trimmedUsername, _id: { $ne: payload._id } })
            if (existingUser) {
                return NextResponse.json({ success: false, message: "Username is already taken" }, { status: 409 })
            }
            user.username = trimmedUsername
        }

        if (fullName !== undefined) {
            if (!fullName.trim()) {
                return NextResponse.json({ success: false, message: "Full name cannot be empty" }, { status: 400 })
            }
            user.fullName = fullName.trim()
        }

        if (bio !== undefined) {
            if (bio.length > 500) {
                return NextResponse.json({ success: false, message: "Bio cannot exceed 500 characters" }, { status: 400 })
            }
            user.bio = bio
        }

        if (socialLinks !== undefined) {
            if (!user.socialLinks) {
                user.socialLinks = {}
            }
            const allowedKeys = ['website', 'twitter', 'instagram', 'github', 'linkedin'] as const
            for (const key of allowedKeys) {
                if (socialLinks[key] !== undefined) {
                    user.socialLinks[key] = socialLinks[key].trim()
                }
            }
            user.markModified('socialLinks')
        }

        await user.save({ validateBeforeSave: false })

        const updatedUser = await User.findById(payload._id).select(
            "avatar coverImage fullName email username subscription fcmTokens isAcceptingMessages bio socialLinks"
        )

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: "Profile updated successfully."
        }, { status: 200 })

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 })
    }
}
