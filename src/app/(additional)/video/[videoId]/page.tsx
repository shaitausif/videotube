"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { VideoInterface } from "@/models/video.model";
import { requestHandler } from "@/utils";
import { getVideoById, getVideoComments, toggleSubscribe } from "@/lib/apiClient";
import { toast } from "sonner";
import Image from "next/image";

import { Cloudinary } from "@cloudinary/url-gen";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
// import { AdvancedVideo } from '@cloudinary/react'
// import { Resize } from '@cloudinary/url-gen/actions'

// const cld = new Cloudinary({
//     cloud : {
//         cloudName : "dhrkajjwf"
//     }
// })

const page = () => {
  const params = useParams();
  const [video, setvideo] = useState<VideoInterface>();
  const [videoComments, setvideoComments] = useState(null);
  const [loadingVideo, setloadingVideo] = useState(false);
  const [loadingComments, setloadingComments] = useState({});
  const [isSubscibed, setisSubscibed] = useState(false)
  const user = useSelector((state : RootState) => state.user)
  const router = useRouter()
  console.log(user)

  useEffect(() => {
    const getVideoInfo = async () => {
      requestHandler(
        async () => await getVideoById(params.videoId),
        setloadingVideo,
        (res) => {
          setvideo(res.data);
          console.log(res.data)
        },
        (err) => toast.error(err)
      );
    };
    getVideoInfo();

    const getvideoComments = async () => {
      requestHandler(
        async () => await getVideoComments(params.videoId),
        setloadingComments,
        (res) => {
          setvideoComments(res.data.comments);
        },
        (err) => toast.error(err)
      );
    };
  }, []);

  const handleToggleSubsribe = async(channelId : string) => {
    requestHandler(
      async() => await toggleSubscribe(channelId),
      null,
      (res) => {
        setisSubscibed(res.data)
        toast(res.data)
      },
      (err) => toast.error(err)
    )
  }


  //     function getPublicIdFromUrl(url: string) {

  //     const parts = url.split('/')
  //     console.log(parts)
  //     const fileNameWithExtension = parts[parts.length - 1]
  //     const fileName = fileNameWithExtension.split('.')[0]
  //     return fileName
  //   }

  return (
    <div className="flex justify-center">
      {loadingVideo ? (
        <div className="grid grid-cols-3 w-full md:px-8 px-4">
          <div className="col-span-2 space-y-5">
            {/* First part with two columns width */}
            <div className="flex flex-col h-[70vh] w-full  space-y-3 col-span-1">
              <Skeleton className="h-[70vh] w-[60vw] rounded-xl" />
              </div>
              <div className="space-y-2 px-2">
                <Skeleton className="h-4 w-full md:w-[40vw]" />
                <Skeleton className="h-4 w-full  md:w-[50vw]" />
              </div>
            
            {/* Second part with 1 column width */}
          </div>
        </div>
      ) : (
        video && (
            <div className="grid grid-cols-3 w-full md:px-8 px-4">
          <div className="col-span-2 space-y-5">
            {/* Video */}
            <div className="flex flex-col gap-5">
              <video
                className="h-[70vh] w-full rounded-2xl"
                controls
                src={video?.videoFile}
              ></video>
              <div className="space-y-2 md:space-y-4 px-2">
                {/* Title of the video */}
                <p className="text-xl md:text-2xl font-semibold ">{video?.title}</p>
                {/* Channel of the Video */}
                <div className="flex justify-between items-center">
                    {/* Avatar of the Channel */}
                    <div className="flex items-center gap-6">
                        <div className="relative w-[50px] h-[50px]">
                        <Image 
                        className="object-cover rounded-full"
                    alt="Avatar of the video owner"
                    fill
                    src={video?.owner?.avatar!}
                    />
                    </div>
                    {/* Channel Name */}
                    <div className="flex flex-col">
                        <p>{video?.owner.fullName}</p>
                        <p>{video.owner.subscribers} Subscribers</p>
                    </div>
                    {/* Subscribe button */}
                    <div onClick={() => {
                        if(user && user._id){
                           handleToggleSubsribe(video.owner._id)
                           return
                        }
                        router.push("/sign-in")
                    }} className="mx-5 font-bold "><Button className="rounded-3xl font-semibold text-md">{user && user._id ? video.owner.isSubscibed ? "Subscribed" : "Subscribe" : "Sign in"}</Button></div>
                    </div>
                    

                </div>
                <p>{video?.description}</p>
              </div>
            </div>
            {/* Video Comments */}
            <div></div>
          </div>
          <div className="col-span-1">Hell</div>
        </div>
        )
      )}
    </div>
  );
};

export default page;
