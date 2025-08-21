"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { requestHandler } from "@/utils";
import { notFound, useRouter } from "next/navigation";
import { userChannelProfile } from "@/lib/apiClient";


const UserProfile = ({username} : {username : any}) => {


  const user = useSelector((state: RootState) => state?.user);
  const [loadingUserInfo, setloadingUserInfo] = useState(false)
  const router = useRouter();

  

  const [subscribersCount, setsubscribersCount] = useState(0);
  const [channelInfo, setchannelInfo] = useState({})


  useEffect(() => {
    const fetchUserInfo = async() => {
      requestHandler(
        async() => await userChannelProfile(username),
        setloadingUserInfo,
        (res) => {
          setchannelInfo(res.data)
          setsubscribersCount(res.data.subscribersCount)
        },
        (err) => {
         
          // @ts-ignore
          if(err?.status == 404)  {
            console.log("redirecting")
            router.replace('/not-found')
            return;
          }
            //@ts-ignore
          toast.error(err.message)
        }
      )
    }
    fetchUserInfo();
  }, []);





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
          <span className="">
            
            @{
              // @ts-ignore
            channelInfo.username} • {subscribersCount}{" "}
            {subscribersCount > 1 ? "Subscribers" : "Subscriber"}
          </span>
        </div>
      </div>
 
    </div>
  );
};

export default UserProfile;
