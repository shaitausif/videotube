import mongoose, { Document, Schema } from "mongoose";


interface paymentInterface extends Document{
    from_user : mongoose.Types.ObjectId
    to_user : string
    order_id : string
    plan : String
    done : boolean
}


const paymentSchema = new Schema<paymentInterface>({
    from_user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    to_user : {
        type : String,
        required : true
    },
    order_id : {
        type : String,      
        required : true
    },

    plan : {
        type : String,
        enum : ["monthly","annual"],
        
    },
    done : {
        type : Boolean,
        default : false
    }
}, {
    timestamps : true
})


export const Payment = mongoose.models.Payment || mongoose.model("Payment",paymentSchema)