import ConnectDB from "@/lib/dbConnect";
import { Payment } from "@/models/payment.model";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";


// We're going to be redirected to this route as the payment gets done and here we have to verify whether the payment was successful or not
export async function POST(req: NextRequest) {
    try {
        let formData = await req.formData()
        let body = Object.fromEntries(formData)

        // Connect to the DB
        await ConnectDB()
        // Check whether the order is present or not in the db
        let p = await Payment.findOne({order_id: body.razorpay_order_id})
        if(!p){
            return NextResponse.json({success : false, message : "Order ID not found"},{status : 404})
        }

        // Now validate the payment with the given credentials
        const xx = validatePaymentVerification({"order_id" : body.razorpay_order_id.toString(), "payment_id" : body.razorpay_payment_id.toString()}, body.razorpay_signature.toString(), process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!)

        if(xx){
            // Updating the payment status in DB
            const updatedPayment = await Payment.findOneAndUpdate({order_id : body.razorpay_order_id}, { done  : true }, {new : true})
            // Update the user subscription status
            console.log(updatedPayment)
            const endDate = new Date(Date.now() + (updatedPayment.plan === "monthly" ? 
                30*24*60*60*1000
                : 365*24*60*60*1000
            ))
            await User.findByIdAndUpdate(updatedPayment.from_user,
                {
                    subscription : {
                        plan : updatedPayment.plan,
                        startDate : new Date(),
                        endDate,
                        active : true
                    }
                }
            )

            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}?paymentdone=true`)
        } else{
            return NextResponse.json({success:false,message:"Payment Verification Failed"})
        }



    } catch (error) {
        return NextResponse.json({success : false, message : error})
    }
}