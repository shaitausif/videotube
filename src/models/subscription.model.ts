import mongoose,{Schema , Document} from "mongoose";


export interface Subscription extends Document{
    subscriber : mongoose.Types.ObjectId,
    channel : mongoose.Types.ObjectId,
    createdAt? : Date,
    updatedAt? : Date,
}

const subscriptionSchema = new Schema<Subscription>(
    {
        subscriber : {
            type : Schema.Types.ObjectId,  // One who's subscribing
            ref : "User"
        },
        channel : {
            type : Schema.Types.ObjectId, // One who's channel got subscribed,
            ref : "User"
        }
    },
    {timestamps : true}
)

export const Subscription = mongoose?.models.Subscription || mongoose.model<Subscription>("Subscription",subscriptionSchema)