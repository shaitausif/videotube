"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { LocalStorage, requestHandler } from "@/utils";
import { useRouter } from "next/navigation";
import { createUserChat, toggleSubscribe, userChannelProfile } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";


interface Channel {
  _id?: string;
  username?: string;
  email?: string;
  fullName?: string;
  avatar?: string;
  coverImage?: string;
  subscribersCount?: number;
  subscribedToCount?: number;
  isSubscribed?: boolean;
  isAcceptingMessages? : boolean
}

const UserProfile = ({ username }: { username: any }) => {
  const user = useSelector((state: RootState) => state?.user);
  const [loadingUserInfo, setloadingUserInfo] = useState(false);
  const [isSubscribed, setisSubscribed] = useState(false);
  const router = useRouter();

  const [subscribersCount, setsubscribersCount] = useState(0);
  const [channelInfo, setchannelInfo] = useState<Channel>({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      requestHandler(
        async () => await userChannelProfile(username),
        setloadingUserInfo,
        (res) => {
          setchannelInfo(res.data);
          setsubscribersCount(res.data.subscribersCount);
          console.log(res)
          setisSubscribed(res.data.isSubscribed);
        },
        (err) => {
          // @ts-ignore
          if (err?.status == 404) {
            console.log("redirecting");
            router.replace("/not-found");
            return;
          }
          //@ts-ignore
          toast.error(err.message);
        }
      );
    };
    fetchUserInfo();
  }, []);

  const handleToggleSubscribe = () => {
    requestHandler(
      async () => await toggleSubscribe(channelInfo?._id!),
      null,
      (res) => {
        setisSubscribed(res.data);
        toast.success(
          `Channel ${res.data ? "Subscribed" : "Unsubscribed"} Successfully.`
        );
        setsubscribersCount((prev) => (res.data ? prev + 1 : prev - 1));
      },
      (err) => toast.error(err)
    );
  };

  const handleMessageUser = () => {
    // First If the chat with the User don't exist then create one
    requestHandler(
      async() => await createUserChat(channelInfo._id!),
      null,
      (res) => {
        console.log(res.data)
        LocalStorage.set('currentChat', res.data)
        router.push('/chat')
      },
      (err) => toast.error(err)
    )
  }



  const placeholderAvatar =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfj3Bm37Nn_rBQHkIzxnpmGMv3AnLWNYvA1_GwXzebfQ7rxLHl0fRsKo6mIi1SmoOiCL4&usqp=CAU";
  const placeholderCover =
    "https://craftsnippets.com/articles_images/placeholder/placeholder.jpg";

  return (
    <div className="flex gap-5 flex-col">
      {/* CoverImage */}
      <div className="w-[85vw] h-[18vw] relative flex justify-end items-end group transition-all duration-300">
        <Image
          alt="Cover Image"
          className="object-cover rounded-2xl group-hover:opacity-90 transition-all duration-300"
          //@ts-ignore
          src={channelInfo.coverImage || placeholderCover} // Provide a fallback
          fill
        />
      </div>

      <div className="w-full flex">
        {/* User profile Icon */}
        <div className="relative flex justify-center items-center group transition-all duration-300 w-[180px] h-[180px] rounded-full">
          <Image
            alt="User Profile Image"
            className="object-cover rounded-full group-hover:opacity-90 transition-all duration-300"
            fill
            //@ts-ignore
            src={channelInfo.avatar || placeholderAvatar} // Provide a fallback
          />
        </div>

        <div className="px-6 py-2 flex flex-col gap-1">
          {/* Additional user information */}
          <span className="text-4xl font-semibold">{user.fullName}</span>
          <span>
            @
            {
              // @ts-ignore
              channelInfo.username
            }{" "}
            • {subscribersCount}{" "}
            {subscribersCount > 1 ? "Subscribers" : "Subscriber"}
          </span>
          <div className="flex gap-4">
          
            {isSubscribed ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className={`
                    rounded-3xl font-semibold hover:bg-gray-300 text-md text-black bg-gray-200 transition-all duration-300 dark:bg-black dark:text-white dark:hover:bg-gray-800
                    `}
                  >
                    Subscribed
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to unsubscribe{" "}
                      {channelInfo.fullName}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleToggleSubscribe();
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                onClick={() => handleToggleSubscribe()}
                className={`
                              rounded-3xl font-semibold text-md
                              `}
              >
                Subscribe
              </Button>
            )}
            {
              channelInfo.isAcceptingMessages && (
                <Button onClick={() => handleMessageUser()} className="rounded-3xl font-semibold text-md">Message</Button>
              )
            }
          </div>
          <div className="px-2 dark:hover:text-gray-400 cursor-pointer transition-all duration-300 dark:text-gray-300">
            <p>{channelInfo.subscribedToCount} {subscribersCount.toString().length > 1 ? "Subscriptions" : "Subscription"}</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default UserProfile;
