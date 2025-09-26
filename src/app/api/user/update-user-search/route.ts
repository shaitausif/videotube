import { Search } from "@/models/search";
import { normalizeQuery } from "@/utils";
import { NextRequest, NextResponse } from "next/server";



// This function is responsible for updating the search results accoring to the users queries

export async function GET(req: NextRequest){
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query")?.trim()

        if(!query || query == " "){
            return NextResponse.json({success : false , message : "Please enter appropriate query", data: []}, {status : 400} )
        }


        const normalizedQuery = normalizeQuery(query)

        const allSearches = await Search.find().sort({count : -1}).select("query")
        const queries = allSearches.filter((s) => s.query.includes(normalizedQuery)).map((s) => s.query )

        if(!queries || queries.length === 0){
            return NextResponse.json({success : true, message : "No search results found"}, {status : 200})
        }
    
        return NextResponse.json({success : true , message : "Search results fetched successfully", data : queries.slice(0,5)},{status : 200})

        

    } catch (error) {
        return NextResponse.json({success : false, message : error}, {status : 500})
    }
}