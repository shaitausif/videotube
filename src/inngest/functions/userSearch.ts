// This function is responsible for storing the users search queries after anlyzing and correcting the query by using AI and then it will compare it with other queries and if other doesn't match with it then create new search schema and then initilize it's count by 1 and if other does then increase the count of the first document to make it in trending

import { Search } from "@/models/search";
import { inngest } from "../client";
import stringSimilarity from "string-similarity";
import { UserSearch } from "@/models/usersearch";
import { NonRetriableError } from "inngest";
import { normalizeQuery } from "@/utils";
// Also add it in the users searched history by creating a schema and if this query already exists in the user db then make it on top by deleting the previous one inserting this one




export const userSearch = inngest.createFunction(
    { id : "user-search"},
    { event : "user/search" },
    async({event}) => {
        try {
            const { query, userId } = event.data


            // Increasing the search count if the query exist
            const allSearches = await Search.find().select("query") 
            const queries = allSearches.map((s) => s.query)
            if(queries.length > 0){
                const match = stringSimilarity.findBestMatch(query, queries)
                 if(match.bestMatch.rating > 0.8){
                await Search.findOneAndUpdate(
                    { query: match.bestMatch.target },
                    { $inc : { count : 1} }
                )
            }else {
                await Search.create({
                    query,
                    count : 1
                })
            }
            } else {
                await Search.create({
                    query,
                    count : 1
                })
            }

           

            // update the user's search query history
            await UserSearch.updateOne(
                { user : userId },
                {
                    // Remove the query if it already exists
                    $pull : { searches : query } 
                }
            )

            const user = await UserSearch.updateOne(
                { user : userId },
                {
                    $push : {
                        // Insert the query at the beginning
                        searches : {
                            $each : [query],
                            $position : 0
                        }
                    }
                }
            )

            if(user.matchedCount === 0){
                const userQuery = await UserSearch.create({
                    user : userId,
                    $push : {
                        searches : normalizeQuery
                    }
                })

                if(!userQuery){
                    throw new NonRetriableError("Unable to create userQuery document")
                }
            }

        } catch (error) {
            console.log(error)
        }
    }
)