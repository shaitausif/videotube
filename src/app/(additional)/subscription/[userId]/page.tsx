"use client";
import { getSubscription } from "@/lib/apiClient";
import { SubscriptionInterface } from "@/models/subscription.model";
import { requestHandler } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import SubscriptionSkel from "../../../../../components/skeletons/SubscriptionSkel";

const page = () => {
  const [isFetching, setisFetching] = useState(false);
  const [subscriptions, setsubscriptions] = useState<
    SubscriptionInterface[] | any[]
  >([]);
  const skeletons = [1, 2, 3, 4, 5, 6];
  const router = useRouter();
  const { userId } = useParams();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      requestHandler(
        async () => await getSubscription(userId?.toString() as string),
        setisFetching,
        (res) => {
          console.log(res);
          setsubscriptions(res.data);
          toast.success(res.message);
        },
        (err) => {
          // @ts-ignore
          toast.error(err.message);
        }
      );
    };
    fetchSubscriptions();
  }, []);

  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-col gap-3 mx-auto md:w-[60vw] rounded-lg p-4">
        {
        isFetching ? (
          [1, 2, 3, 4, 5, 6].map((skel) => (
            <div key={skel} className="flex justify-center">
              <SubscriptionSkel />
            </div>
          ))
        ) : subscriptions.length > 0 ? (
          subscriptions.map((subscription) => (
            
              <div
                onClick={() =>
                  router.push(`/c/${subscription.channel.username}`)
                }
                key={subscription._id}
                className="flex relative items-center gap-5 cursor-pointer hover:bg-gray-900 transition-all duration-300 w-full px-4 py-2  rounded-lg"
              >
                <div className="w-[100px] h-[100px] relative">
                  {/* User Avatar Image */}
                  <Image
                    src={subscription.channel.avatar || "/AltProfile.png"}
                    fill
                    alt="User Profile Image"
                    className="object-cover rounded-full"
                  />
                </div>

                {/* User Information */}
                <div className="flex flex-col">
                  <span className="md:text-xl font-semibold">
                    {subscription.channel.fullName}
                  </span>
                  <span className="text-gray-400 text-sm hover:text-gray-500 transition-all duration-300">
                    @{subscription.channel.username}
                  </span>
                  <span className="text-[12px] text-gray-400">
                    {subscription.channel.subscribersCount} Subscribers
                  </span>
                </div>
                <span className="text-sm text-gray-300 absolute top-4 right-4">
                  {formatDistanceToNow(subscription.channel.createdAt)}
                </span>
              </div>
        
          ))
        ) : (
          <div className="flex h-[70vh] w-full justify-center items-center text-xl">
            No Subscriptions Found
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
