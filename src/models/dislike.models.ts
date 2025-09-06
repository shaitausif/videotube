import mongoose, { Schema , Document } from "mongoose";

export interface disLikeInterface extends Document{
    video : mongoose.Types.ObjectId,
    comment : mongoose.Types.ObjectId,
    tweet : mongoose.Types.ObjectId,    
    post : mongoose.Types.ObjectId,
    disLikedBy : mongoose.Types.ObjectId,
    createdAt? : Date,
    updatedAt? : Date,
}


const disLikeSchema = new Schema<disLikeInterface>(
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
        post : {
            type : Schema.Types.ObjectId,
            ref : "Post"
        },
        disLikedBy : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {timestamps : true}
)


export const Dislike = mongoose.models.Dislike || mongoose.model<disLikeInterface>("Dislike",disLikeSchema)