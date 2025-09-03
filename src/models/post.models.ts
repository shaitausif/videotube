import mongoose, { Schema } from "mongoose";
import { boolean } from "zod";


export interface PostInterface{
    postImg? : string;
    caption : string;
    owner : mongoose.Schema.Types.ObjectId;
    isEdited? : Boolean;
    createdAt : Date;
    updatedAt : Date
}


const postSchema = new Schema<PostInterface>({
    postImg : {
        type : String
    },
    caption : {
        type : String,
        required : true
    },
    owner : {
        type : mongoose.Types.ObjectId,
        ref : "User"
    },
    isEdited : {
        type : Boolean,
        default : false
    }
}, {
    timestamps : true
})


export const Post = mongoose.models.Post || mongoose.model("Post",postSchema)