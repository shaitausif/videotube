import mongoose,{Document, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


export interface Comments extends Document{
    content : string,
    video : mongoose.Types.ObjectId,
    owner : mongoose.Types.ObjectId,
    createdAt? : Date,
    updatedAt? : Date,
}



// we can't give all the comments or videos to the user that's why here we're using mongooseAggregatePaginate
const commentSchema = new Schema(
    {
        content : {
            type : String,
            required : true
        },
        video : {
            type : Schema.Types.ObjectId,
            ref : "Video"
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    }   
    ,{timestamps : true}
)

export const Comment = mongoose.models.Comment || mongoose.model("Comment",commentSchema)

commentSchema.plugin(mongooseAggregatePaginate)