"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { VideoInterface } from "@/models/video.model";
import { requestHandler } from "@/utils";
import {
  getVideoById,
  getVideoComments,
  toggleSubscribe,
  toggleVideoLike,
} from "@/lib/apiClient";
import { toast } from "sonner";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// import { Cloudinary } from "@cloudinary/url-gen";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import VideoSkel from "../../../../../components/skeletons/VideoSkel";
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
  const [isSubscribed, setisSubscribed] = useState(false);
  const [subscribersCount, setsubscribersCount] = useState(0);
  const [likesCount, setlikesCount] = useState(0)
  const [isLiked, setisLiked] = useState(false)
  const [commentsCount, setcommentsCount] = useState(0)
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    const getVideoInfo = async () => {
      requestHandler(
        async () => await getVideoById(params.videoId),
        setloadingVideo,
        (res) => {
          setvideo(res.data);
          setisSubscribed(res.data.owner.isSubscribed);
          
          setsubscribersCount(res.data.owner.subscribers);

          setisLiked(res.data.isLiked)
          setlikesCount(res.data.likes)
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
          setcommentsCount(res.data.total)
          setvideoComments(res.data.comments);
        },
        (err) => toast.error(err)
      );
    };
  }, []);

  const handleToggleSubscribe = async (channelId: string) => {
    console.log("Hi, toggle subscribe");
    requestHandler(
      async () => await toggleSubscribe(channelId),
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

  const handleToggVideoleLike = async(videoId: string) => {
    requestHandler(
      async () => await toggleVideoLike(videoId),
      null,
      (res) => {
        setisLiked(res.data)
        setlikesCount((prev) => (res.data ? prev + 1 : prev - 1))
        console.log(res.message,res.data)
      },
      (err) => toast.error(err)
    )
  }

  return (
    <div className="flex justify-center">
      {loadingVideo ? (
        <VideoSkel />
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
                  <p className="text-xl md:text-2xl font-semibold ">
                    {video?.title}
                  </p>
                  {/* Channel of the Video */}
                  <div className="flex justify-between items-center">
                    {/* Avatar of the Channel */}
                    <div onClick={() => {
                      if(user._id === video.owner._id){
                        router.push('/profile')
                        return;
                      }
                      // Push User's to the Channel Profile
                    }} className="flex items-center gap-6  cursor-pointer rounded-full transition-all duration-300 dark:hover:bg-black/50">
                      <div className="relative w-[50px] h-[50px]">
                        <Image
                          className="object-cover rounded-full"
                          alt="Avatar of the video owner"
                          fill
                          src={video?.owner?.avatar!}
                        />
                      </div>  
                      {/* Channel Name */}
                      <div className="flex flex-col ">
                        <p>{video?.owner.fullName}</p>
                        <p>{subscribersCount} Subscribers</p>
                      </div>
                      {/* Subscribe button */}
                      <div className={`mx-5 font-bold`}>
                        {user && user._id ? (
                          user._id === video.owner._id ? (
                            // Button if it's user's own channel
                            <Button
                              
                              className={`
                    rounded-3xl font-semibold text-md
                    `}
                            >
                              Your Channel
                            </Button>
                          ) : isSubscribed ? (
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
                                    {video.owner.fullName}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      handleToggleSubscribe(video.owner._id);
                                    }}
                                  >
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            // Button for Subscribing the channel
                            <Button
                              onClick={() =>
                                handleToggleSubscribe(video.owner._id)
                              }
                              className={`
                    rounded-3xl font-semibold text-md
                    `}
                            >
                              Subscribe
                            </Button>
                          )
                        ) : (
                          // Button for Redirecting the User to sign-in page
                          <Button
                            onClick={() => router.push("/sign-in")}
                            className={`
                    rounded-3xl font-semibold text-md
                    `}
                          >
                            Sign in
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Like and Dislike button */}

                    <div className="flex gap-5 justify-center items-center">
                      <button
                      onClick={() => handleToggVideoleLike(video._id as string)}
                      className={`p-1  w-15 h-15 rounded-full hover:bg-gray-600 transition-all duration-300 flex items-center justify-center ${isLiked ? "bg-gray-500" : ""}`}>
                        <ThumbsUp className="w-6 h-6" /> <span className="px-2">{likesCount}</span>
                      </button>
                      <button className="p-1 w-15 h-15 rounded-full hover:bg-gray-600 transition-all duration-300 flex items-center justify-center">
                        <ThumbsDown className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  {/* Video Description */}
                  <div className="col-span-2 flex flex-col gap-2 w-full transition-all duration-300 md:px-4 px-2 py-2 rounded-lg dark:bg-gray-800 dark:hover:bg-gray-900">
                    {/* Video Views and Video creation date */}
                    <div className="text-sm text-gray-400">
                      <span>
                        {video.views} views •{" "}
                        {formatDistanceToNow(new Date(video.createdAt!), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    {/* Description */}
                    <div className="text-[15px] text-gray-200">
                      {video.description.length > 200
                        ? video.description.slice(0, 200) + "...more"
                        : video.description}
                    </div>
                  </div>
                </div>
              </div>
              {/* Video Comments */}
              <div className="">
                    


              </div>
            </div>
            <div className="col-span-1">Hell</div>
          </div>
        )
      )}
    </div>
  );
};

export default page;
