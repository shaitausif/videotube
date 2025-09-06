"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { VideoInterface } from "@/models/video.model";
import { requestHandler } from "@/utils";
import {
  getVideoById,
  postComment,
  toggleSubscribe,
  toggleVideoDisLike,
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
import { ThumbsDown, ThumbsUp, VideoOffIcon } from "lucide-react";
import VideoSkel from "../../../../../components/skeletons/VideoSkel";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostCommentSchema } from "@/schemas/PostCommentSchema";


import AllComments from "../../../../../components/AllComments";
import CommentLoader from "../../../../../components/skeletons/Loader";
import SuggestVideos from "../../../../../components/SuggestVideos";
// import { AdvancedVideo } from '@cloudinary/react'
// import { Resize } from '@cloudinary/url-gen/actions'

// const cld = new Cloudinary({
//     cloud : {
//         cloudName : "dhrkajjwf"
//     }
// })

const page = () => {
  const router = useRouter();

  const params = useParams();

  const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  if (!isValidObjectId(params.videoId as string)) {
    return notFound();
  }

  const [video, setvideo] = useState<VideoInterface>();
  const [videoComments, setvideoComments] = useState<any[]>([]);
  const [loadingVideo, setloadingVideo] = useState(false);
  const [loadingComments, setloadingComments] = useState({}); 
  const [isSubscribed, setisSubscribed] = useState(false);
  const [subscribersCount, setsubscribersCount] = useState(0);
  const [likesCount, setlikesCount] = useState(0);
  const [disLikesCount, setdisLikesCount] = useState(0)
  const [isLiked, setisLiked] = useState(false);
  const [isDisLiked, setisDisLiked] = useState(false)
  const [commentsCount, setcommentsCount] = useState(0);
  const [openDescription, setopenDescription] = useState(false);
  const [isPostingComment, setisPostingComment] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const getVideoInfo = async () => {
      requestHandler(
        async () => await getVideoById(params.videoId),
        setloadingVideo,
        (res) => {
          setvideo(res.data);
          setisSubscribed(res.data.owner.isSubscribed);
          setsubscribersCount(res.data.owner.subscribers);
          setisLiked(res.data.isLiked);
          setlikesCount(res.data.likes);
          setisDisLiked(res.data.isdisLiked)
          setdisLikesCount(res.data.dislikes)
        },
        (err) => {
          // @ts-ignore
          if (err?.status == 404) {
            console.log("redirecting");
            router.replace("/not-found");
            return;
          }
          //@ts-ignore
          toast.error(err?.message);
        }
      );
    };
    getVideoInfo();

    
  }, []);

  const form = useForm<z.infer<typeof PostCommentSchema>>({
    resolver: zodResolver(PostCommentSchema),
    defaultValues: {
      comment: "",
    },
  });




  const subscriberTimer = useRef<{ [key: string]: NodeJS.Timeout }>({})


  const handleToggleSubscribe = async (channelId: string) => {

    // I am also using debouncing technique here for subscribing and unsubscribing a user for optimization

    setsubscribersCount((prev) => isSubscribed ? prev - 1 : prev + 1)
    setisSubscribed(!isSubscribed)
    
    // Clearing previous timer for this one
    if(subscriberTimer.current[channelId]){
      clearTimeout(subscriberTimer.current[channelId])
    }

    // Setting a new timer 
    subscriberTimer.current[channelId] = setTimeout(() => {
      requestHandler(
      async () => await toggleSubscribe(channelId),
      null,
      (res) => {
        // setisSubscribed(res.data);
        toast.success(
          `Channel ${res.data ? "Subscribed" : "Unsubscribed"} Successfully.`
        );

        // setsubscribersCount((prev) => (res.data ? prev + 1 : prev - 1));
      },
      (err) => toast.error(err)
    );
    // Cleanup
    delete subscriberTimer.current[channelId];
    }, 2000);

    
  };


    const videoLikeTimer = useRef<{ [key: string]: NodeJS.Timeout }>({})


  const handleToggleVideoLike = async (videoId: string) => {

    // Using the same debounce technique here as well
    setlikesCount((prev) => isLiked ? prev - 1 : prev + 1)
    setisLiked(!isLiked)


    if(videoLikeTimer.current[videoId]){
      clearTimeout(videoLikeTimer.current[videoId])
    }


    // create a new timer
    videoLikeTimer.current[videoId] = setTimeout(() => {
      requestHandler(
      async () => await toggleVideoLike(videoId),
      null,
      (res) => {
        // setisLiked(res.data);
        // setlikesCount((prev) => (res.data ? prev + 1 : prev - 1));
        console.log(res.message, res.data); 
      },
      (err) => {
        toast.error("Sign in to like the video")
        // console.log(err)
      }
    );
    delete videoLikeTimer.current[videoId]
    }, 2000);

  };


  const videoDisLikeTimer = useRef<{ [key: string]: NodeJS.Timeout }>({})


  const handleToggleVideoDislike = async(videoId : string) => {

    setdisLikesCount((prev) => isDisLiked ? prev - 1 : prev + 1)
    setisDisLiked(!isDisLiked)

    if(videoDisLikeTimer.current[videoId]){
      clearTimeout(videoDisLikeTimer.current[videoId])
    }

    videoDisLikeTimer.current[videoId] = setTimeout(() => {
      requestHandler(
        async() => await toggleVideoDisLike(videoId.toString()),
        null,
        (res) => {
          console.log(res)
          toast.success(res.message)
        },
        (err) => {
          // @ts-ignore
          toast.error(err.message)
        }
      )
      delete videoDisLikeTimer.current[videoId]
    }, 2000);

  }




  return (
    <div className="flex w-full justify-center">
      {loadingVideo ? (
        <VideoSkel />
      ) : (
        video && (
          <div className="grid grid-cols-5 w-full  mx-2 md:mx-12">
            <div className="col-span-3 space-y-5">
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
                    <div
                      onClick={() => {
                        if (user._id === video.owner._id) {
                          router.push("/profile");
                          return;
                        }
                        // Push User's to the Channel Profile
                      }}
                      className="flex items-center gap-6  cursor-pointer rounded-full transition-all duration-300 dark:hover:bg-black/50"
                    >
                      <div
                        onClick={() => {
                          if (user._id !== video.owner._id) {
                            router.push(`/c/${video.owner.username}`);
                          }
                        }}
                        className="relative w-[50px] h-[50px]"
                      >
                        <Image
                          className="object-cover rounded-full"
                          alt="Avatar of the video owner"
                          fill
                          src={video?.owner?.avatar!}
                        />
                      </div>
                      {/* Channel Name */}
                      <div
                        onClick={() => {
                          if (user._id !== video.owner._id) {
                            router.push(`/c/${video.owner.username}`);
                          }
                        }}
                        className="flex flex-col "
                      >
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
                        className={`w-15 h-15 rounded-full  transition-all duration-300 flex items-center justify-center `}
                      >
                        <span
                          onClick={() =>{
                            handleToggleVideoLike(video._id as string)
                            if(isDisLiked){
                              handleToggleVideoDislike(video._id as string)
                            }
                          }
                            
                          }
                          className={`transition-all duration-300 p-2 rounded-full dark:hover:bg-gray-800 `}
                        >
                          <ThumbsUp fill={`${isLiked ? 'white' : ""}`} className="w-6 h-6" />
                        </span>{" "}
                        <span className="px-2">{likesCount}</span>
                      </button>
                      <button className="w-15 h-15 rounded-full transition-all duration-300 flex items-center justify-center">
                        {" "}
                        <span className="px-2">{disLikesCount}</span>
                        <span
                        onClick={() => {
                          handleToggleVideoDislike(video._id as string)
                          if(isLiked){
                            handleToggleVideoLike(video._id as string)
                          }
                        }} 
                          className={`transition-all duration-300 p-2 rounded-full dark:hover:bg-gray-800 `}
                        >
                        
                          <ThumbsDown  fill={`${isDisLiked ? 'white' : ""}`} className="w-6 h-6" />
                        </span>{" "}
                        
                      </button> 
                    </div>
                  </div>
                  {/* Video Description */}
                  <div className="col-span-2 flex flex-col gap-2 w-full transition-all duration-300 md:px-4 px-2 py-2 rounded-lg dark:bg-gray-800 dark:hover:bg-gray-900">
                    {/* Video Views and Video creation date */}
                    <div className="text-sm text-gray-700 dark:text-gray-400">
                      <span>
                        <span>{video.views} views • </span>
                        {openDescription ? (
                          <span>
                            {new Date(video.createdAt!).toLocaleDateString(
                              "en-US",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        ) : (
                          <span>
                            {formatDistanceToNow(new Date(video.createdAt!), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </span>
                    </div>
                    {/* Description */}
                    {openDescription ? (
                      <div className="text-[15px] dark:text-gray-200 flex flex-col ">
                        <div className="text-[15px] dark:text-gray-200">
                          {video.description.length > 0 && video.description}{" "}
                          <span
                            onClick={() => setopenDescription(false)}
                            className="cursor-pointer text-gray-600 dark:text-gray-400"
                          >
                            <br />
                            ...show less
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setopenDescription(true)}
                        className="text-[15px] dark:text-gray-200"
                      >
                        {video.description.length > 200
                          ? video.description.slice(0, 200) + "...show more"
                          : video.description}{" "}
                        <span className="cursor-pointer text-gray-600 dark:text-gray-400">
                          ... more
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Comments POST and GET */}
                <AllComments videoId={video._id as string} />
                </div>
              </div>
            </div>
            {/* Suggesting Videos */} 
            <div className="col-span-2 w-full">
              <SuggestVideos videoId={video._id as string} />
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default page;
