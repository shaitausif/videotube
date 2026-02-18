import { inngest } from "@/inngest/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Video } from "@/models/video.model";
import { normalizeQuery } from "@/utils";
import { NextRequest, NextResponse } from "next/server";


// This controller is responsible for sending the searched videos to the client along with adding the queries in client history and updating the trending searches using Inngest in the background
export async function GET(req: NextRequest){
    try {
        const {payload} = await getCurrentUser(req)
        const { searchParams } = new URL(req.url)
        const query = searchParams.get("query")?.trim()
        
        if(!query || query === ""){
            return NextResponse.json({success : false, message : "Please provide an appropriate query"}, {status : 400})
        }

        // Filter params
        const sortBy = searchParams.get("sortBy") || "relevance" // relevance | date | views
        const uploadDate = searchParams.get("uploadDate") || "" // hour | today | week | month | year
        const duration = searchParams.get("duration") || "" // short (<4min) | medium (4-20min) | long (>20min)
        const page = parseInt(searchParams.get("page") || "1", 10)
        const limit = parseInt(searchParams.get("limit") || "20", 10)

        // Fire inngest event for trending/history (background, non-blocking)
        if(payload?._id){
            await inngest.send({
                name : 'user/search',
                data : {
                    query,
                    userId : payload._id
                }
            })
        }

        await ConnectDB()

        const normalizedQuery = normalizeQuery(query)

        // Build base filter
        const filter: Record<string, any> = { isPublished: true }

        // Upload date filter
        if (uploadDate) {
            const now = new Date()
            let dateThreshold: Date | null = null
            switch (uploadDate) {
                case "hour":
                    dateThreshold = new Date(now.getTime() - 60 * 60 * 1000)
                    break
                case "today":
                    dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000)
                    break
                case "week":
                    dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    break
                case "month":
                    dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    break
                case "year":
                    dateThreshold = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
                    break
            }
            if (dateThreshold) {
                filter.createdAt = { $gte: dateThreshold }
            }
        }

        // Duration filter (in seconds)
        if (duration) {
            switch (duration) {
                case "short":
                    filter.duration = { $lt: 240 } // <4 min
                    break
                case "medium":
                    filter.duration = { $gte: 240, $lte: 1200 } // 4-20 min
                    break
                case "long":
                    filter.duration = { $gt: 1200 } // >20 min
                    break
            }
        }

        // Determine sort
        let sort: Record<string, any> = {}
        switch (sortBy) {
            case "date":
                sort = { createdAt: -1 }
                break
            case "views":
                sort = { views: -1 }
                break
            case "relevance":
            default:
                sort = { score: { $meta: "textScore" }, views: -1 }
                break
        }

        const skip = (page - 1) * limit

        // Strategy 1: MongoDB text search (semantic — matches stemmed words, scores by weight)
        let textFilter = { ...filter, $text: { $search: query } }
        let videos = await Video.find(textFilter, sortBy === "relevance" ? { score: { $meta: "textScore" } } : undefined)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate({ path: "owner", select: "username fullName avatar" })
            .lean()

        let totalCount = await Video.countDocuments(textFilter)

        // Strategy 2: Fallback to regex if text search yields 0 results (handles partial matches)
        if (videos.length === 0) {
            // Split query into words and match any word
            const words = normalizedQuery.split(/\s+/).filter(Boolean)
            const regexPatterns = words.map((w) => new RegExp(w, "i"))

            const regexFilter = {
                ...filter,
                $or: [
                    { title: { $in: regexPatterns } },
                    { description: { $in: regexPatterns } }
                ]
            }

            // For regex fallback, sort by views or date (no text score available)
            const fallbackSort = sortBy === "relevance" ? { views: -1 as const } : sort

            videos = await Video.find(regexFilter)
                .sort(fallbackSort)
                .skip(skip)
                .limit(limit)
                .populate({ path: "owner", select: "username fullName avatar" })
                .lean()

            totalCount = await Video.countDocuments(regexFilter)
        }
        
        if(videos.length === 0){
            return NextResponse.json({success : true, message : "No search results found", data: [], totalCount: 0, page, totalPages: 0 },{status : 200})
        }

        const totalPages = Math.ceil(totalCount / limit)

        return NextResponse.json({
            success : true,
            message : "Videos fetched successfully",
            data : videos,
            totalCount,
            page,
            totalPages
        },{ status : 200 })


    } catch (error: any) {
        return NextResponse.json({success : false, message : error?.message || "Internal server error"}, { status : 500 })
    }
}