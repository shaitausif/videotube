import mongoose, { Schema , Document } from "mongoose";

export interface Like extends Document{
    video : mongoose.Types.ObjectId,
    comment : mongoose.Types.ObjectId,
    tweet : mongoose.Types.ObjectId,
    likedBy : mongoose.Types.ObjectId,
    createdAt? : Date,
    updatedAt? : Date,
}


const likeSchema = new Schema<Like>(
    {
        video : {
            type : Schema.Types.ObjectId,
            ref : "Video"
        },
        comment : {
            type : Schema.Types.ObjectId,
            ref : "Comment"
        },
        tweet : {
            type : Schema.Types.ObjectId,
            ref : "Tweet"
        },
        likedBy : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {timestamps : true}
)


export const Like = mongoose.models.Like || mongoose.model<Like>("Like",likeSchema)