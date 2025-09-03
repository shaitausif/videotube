import mongoose,{Schema , Document} from "mongoose";


export interface SubscriptionInterface extends Document{
    subscriber : mongoose.Types.ObjectId,
    channel : mongoose.Types.ObjectId,
    createdAt? : Date,
    updatedAt? : Date,
}

const subscriptionSchema = new Schema<SubscriptionInterface>(
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

export const Subscription = mongoose?.models.Subscription || mongoose.model<SubscriptionInterface>("Subscription",subscriptionSchema)