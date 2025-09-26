import mongoose, { Schema } from "mongoose";


export interface UserSearchInterface{
    user : mongoose.Schema.Types.ObjectId;
    query : [String]
}


const UserSearchSchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    searches : {
        type : [String]
    }
}, {
    timestamps : true
})



export const UserSearch = mongoose.models.UserSearch || mongoose.model("UserSearch",UserSearchSchema)