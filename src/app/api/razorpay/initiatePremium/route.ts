import { Payment } from "@/models/payment.model";
import ConnectDB from "@/lib/dbConnect";
import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

// Get more info: https://razorpay.com/docs/payments/payment-gateway/callback-url/?preferred-country=IN
export async function POST(req: NextRequest) {
  try {
    const { from_user, plan } = await req.json();
    // Extract razorpay ID and Secret
    const razorpay_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
    const razorpay_secret = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!;

    const planPrices: Record<string, number> = {
      monthly: 12900, // in paise
      annual: 99900,
    };

    if (!planPrices[plan]) {
      return NextResponse.json(
        { success: false, message: "Invalid plan" },
        { status: 400 }
      );
    }

    // Create a razorpay instance using these Id's and secret
    let instance = new Razorpay({
      key_id: razorpay_id,
      key_secret: razorpay_secret,
    });

    let options = {
      amount: planPrices[plan],
      currency: "INR",
    };

    // Initiate the order using that razorpay instance
    let order = await instance.orders.create(options);

    // create a payment object which shows a pending payment in the database
    await ConnectDB();

    console.log("Plan buddy", plan);
    const payment = await Payment.create({
      order_id: order.id,
      from_user: new mongoose.Types.ObjectId(from_user),
      to_user: "VideoTube",
      plan,
    });

    if (!payment)
      return NextResponse.json(
        { success: false, message: "Unable to create the payment order in db" },
        { status: 500 }
      );
    return NextResponse.json(
      { success: true, data: order, message: "Order created successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error });
  }
}
