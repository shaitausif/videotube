import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import ConnectDB from "@/lib/dbConnect";
import { Subscription } from "@/models/subscription.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// This function is responsible for toggling subscription of user for a particular channel
export async function POST(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const { channelId } = params;
    const payload = await getCurrentUser(req);
    if (!payload)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    await ConnectDB();
    const isSubscribed = await Subscription.findOne({
      channel: channelId,
      subscriber: payload?._id,
    });
    if (!isSubscribed) {
      const subscribe = await Subscription.create({
        channel: channelId,
        subscriber: payload?._id,
      });
      if (!subscribe)
        return NextResponse.json(
          { success: false, message: "Unable to subscribe the channel" },
          { status: 500 }
        );
      return NextResponse.json({
        success: true,
        data: true,
        message: "Channel subscribed successfully.",
      });
    }

    const { deletedCount } = await isSubscribed.deleteOne();
    if (deletedCount !== 1)
      return NextResponse.json(
        { success: false, message: "Unable to unsubscribe the channel" },
        { status: 500 }
      );
    return NextResponse.json(
      {
        success: true,
        data: false,
        message: "Channel Unsubscribed Successfully.",
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

// This function is responsible for giving us the channels the particular user has subscribed
export async function GET(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const { channelId } = params;
    const payload = await getCurrentUser(req);
    if (!payload)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    await ConnectDB();
    // const subscribedToChannels = await Subscription.find({
    //     subscriber : channelId
    // }).populate({
    //     path : "channel",
    //     select : "username avatar fullName createdAt"
    // }).sort({
    //     createdAt : -1
    // })

    const subscribedToChannels = await Subscription.aggregate([
      {
        $match: {
          subscriber: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channel",
          pipeline: [
            {
              $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribersCount",
              },
            },
            {
              $addFields: {
                subscribersCount: { $size: "$subscribersCount" },
              },
            },

            {
              $project: {
                avatar: 1,
                fullName: 1,
                username: 1,
                createdAt: 1,
                subscribersCount: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$channel",
      },
    ]);

    if (subscribedToChannels.length === 0 || !subscribedToChannels) {
      return NextResponse.json(
        { success: false, data: [], message: "No channel subscribed" },
        {
          status: 200,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: subscribedToChannels,
        message: "Channels fetched successfully.",
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
