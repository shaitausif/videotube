import mongoose, { Schema } from "mongoose";
import { unique } from "next/dist/build/utils";


export interface SearchInterface{
    query : string;
    count : number
}


const SearchSchema = new Schema({
    query : {
        type : String,
        unique : true
    },
    count : {
        type : Number
    }
}, {
    timestamps : true
})



export const Search = mongoose.models.Search || mongoose.model("Search",SearchSchema)