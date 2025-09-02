import mongoose, { Schema , Document} from "mongoose";

export interface TweetInterface extends Document{
    owner: mongoose.Types.ObjectId,
    content : string,
        createdAt? : Date,
    updatedAt? : Date,
}

const tweetSchema = new Schema<TweetInterface>(
    {
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        content : {
            type : String,
            required : true 
        }
    },
    {timestamps : true}
)

export const Tweet = mongoose.models.Tweet || mongoose.model<TweetInterface>("Tweet",tweetSchema)