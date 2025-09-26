import { User } from "@/models/user.model";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Getting these informations from user's token doesn't matter whethere if it is from oauth or credentials
    const payload = await getCurrentUser(req);

    if (!payload)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    await ConnectDB();
    const user = await User.findOne({ _id: payload._id }).select(
      "-password -verifyCode -isVerified -watchHistory -fcmTokens -VerifyCodeExpiry"
    );
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Also I have to check if the plan has expired or not

    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset to 00:00:00

    const end = new Date(user.subscription.endDate);
    end.setHours(0, 0, 0, 0);

    console.log(end <= today);
    console.log(user.subscription)
    console.log(user.subscription.active && end <= today)
    if (user.subscription.active && end <= today) {
      user.subscription.active = false;
      user.subscription.plan = "free";
      await user.save({ validateBeforeSave: false });
      console.log(user.subscription);
      return NextResponse.json(
        {
          success: false,
          data: user,
          message: "User Information fetched successfully!",
          isPlanExpired: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "User Information fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
