import { UserInterface } from "@/interfaces/user";
import mongoose,{Schema, Document} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


export interface VideoInterface extends Document{

    videoFile : string,
    thumbnail : string,
    title : string,
    description : string,
    duration : number,
    views : number,
    isPublished : boolean,
    owner? : any,
    createdAt? : Date,
    updatedAt? : Date,
    likes? : number,
    isLiked? : boolean
}


const videoSchema = new Schema<VideoInterface>(
    {
        videoFile : {
            type : String,  // cloudinary url
            required : [true,"Video is required"]
        },
        thumbnail : {
            type : String,
            required : [true,"Thumbnail is required"]
        },
        title : {
            type : String,
            required : [true, "Title is required"]
        },
        description : {
            type : String,
            required : [true,"Description is required"]
        },
        duration : {
            type : Number,
            required : true
        },
        views : {
            type : Number,
            default : 0,
            
        },
        isPublished :{
            type : Boolean,
            default : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    }
    ,{timestamps : true}
)

// Here, we're adding plugins and this feature is provided by the mongoose
videoSchema.plugin(mongooseAggregatePaginate)   
// And now here we can write aggregation pipeline queries of mongodb easily

export const Video =  mongoose.models.Video || mongoose.model<VideoInterface>("Video",videoSchema)