"use client";
import { deleteVideo, getAllVideos } from "@/lib/apiClient";
import { VideoInterface } from "@/models/video.model";
import { formatVideoDuration, requestHandler } from "@/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import AllVideosSkel from "./skeletons/AllVideosSkel";
import { DropdownMenu, DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { EllipsisVertical, EllipsisVerticalIcon } from "lucide-react";
import { DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import dynamic from "next/dynamic";

const DynamicModal = dynamic(() => import("./user/UploadContentModal"))

const AllVideos = () => {
  const [videos, setvideos] = useState<VideoInterface[]>([]);
  const [loadingVideos, setloadingVideos] = useState(false);  
  const [isModalOpen, setisModalOpen] = useState(false)
  const router = useRouter();
  const skeleton = [1, 2, 3, 4, 5, 6];
  const user = useSelector((state: RootState) => state.user)

  useEffect(() => {
    const fetchAllVideos = async () => {
      console.log("Fetching videos")
      requestHandler(
        async () => await getAllVideos(),
        setloadingVideos,
        (res) => {
          setvideos(res.data);
          toast.success("Videos fetched successfully.");  
        },
        //@ts-ignore
        (err) => toast.error(err.message)
      );
    };
    fetchAllVideos();
  }, []);


  const handleDeleteVideo = async(videoId: string) => {
    requestHandler(
      async() => await deleteVideo(videoId.toString()),
      null,
      (res) => {
        toast.success(res.message)
        setvideos((prev) => prev.filter((p) => p._id !== videoId))
      },
      (err) => {
        console.log(err)
        // @ts-ignore
        toast.error(err.message)
      }
    )
  }


  return (
   <>
      {
        isModalOpen && (
          <DynamicModal onClose={() => setisModalOpen(false)} />
        )
      }
         <div className="md:grid gap-5 grid-cols-3 w-full flex flex-col">
      {loadingVideos
        ? skeleton.map((skel) => (
          <div key={skel}>
            <AllVideosSkel />
            </div>
          ))
        : videos.length === 0 ? (
          <div className="col-span-3 gap-2 w-full flex justify-center items-center h-[80vh] flex-col">
            <div className="text-2xl">No Videos yet.</div>
            <div
            onClick={() => setisModalOpen(true)}
            className="text-lg cursor-pointer text-gray-400 hover:text-gray-500 transition-all duration-300">Start by yourself then!</div>
          </div>
        ) : (
          videos.map((video) => (
            <div
              key={video._id as string}
              className="col-span-1 rounded-lg h-[50vh] group hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-900 transition-all duration-300 group"
              onClick={() => {
                router.push(`/video/${video._id}`);
              }}
            >
              <div className="w-full object-cover relative h-[68%] ">
                
                <div className="absolute z-10 text-white bg-black/90 p-1 rounded-md bottom-2 right-5">
                  {formatVideoDuration(video.duration)}
                </div>
                <Image
                  src={
                    video.thumbnail ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfj3Bm37Nn_rBQHkIzxnpmGMv3AnLWNYvA1_GwXzebfQ7rxLHl0fRsKo6mIi1SmoOiCL4&usqp=CAU"
                  }
                  alt="Video Thumbnail"
                  className="object-cover rounded-lg dark:rounded-t-lg group-hover:opacity-90 transition-all duration-300"
                  fill
                  priority
                />
              </div>
              <div className="flex  py-4 px-2 gap-3">
                {/* Video Owner avatar */}
                <div className="relative w-[32px] h-[32px]">
                  <Image
                    src={
                      (video?.owner?.avatar as string) ||
                      "./public/AltProfile.png"
                    }
                    alt="avatar"
                    className="object-cover object-center rounded-full"
                    fill
                    priority
                  />
                </div>
                <div className="flex flex-col w-full">
                  <span className="text-lg">{video.title!}</span>
                  <span className="text-sm text-gray-600 font-semibold dark:text-gray-400">
                    {video.owner.fullName!}
                  </span>
                  <span className="flex justify-between h-full relative">
                    <span className="text-[12px] text-gray-600 dark:text-gray-400">
                    {video.views} views •{" "}
                    {formatDistanceToNow(new Date(video.createdAt!), {
                      addSuffix: true,
                    })}</span>
                    <span className="md:hidden absolute bottom-0 right-0 group-hover:block transition-all duration-300 hover:bg-gray-700 p-1 rounded-full">
                        <DropdownMenu modal={false}>
                  <DropdownMenuTrigger onClick={(e) => e.stopPropagation() } asChild>
                    <EllipsisVertical className="w-6 h-6 p-1 rounded-full  transition-all duration-300 " />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-25 dark:bg-[#161616]/50"
                    align="center"
                  >
                    {
                      // @ts-ignore
                      video.owner._id !== user._id ? (
                        // @ts-ignore
                        <DropdownMenuItem
                          className="transition-all duration-300"
                          onClick={(e) =>
                          {
                            e.stopPropagation()
                            router.push(`/c/${video.owner.username}`)
                          }
                          }
                        >
                          Channel
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          asChild
                          className="transition-all duration-300"
                        >
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                              onClick={(e) => e.stopPropagation()}
                              className="w-full z-500 transition-all duration-300">
                                Delete Video
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to Delete this Video?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={(e) => e.stopPropagation() }>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) =>{
                                    e.stopPropagation();
            
                                     handleDeleteVideo(video._id as string)
                                  }
                                    
                                  }
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>
                      )
                    }
                  </DropdownMenuContent>
                </DropdownMenu>
                    </span>
                  </span> 
                      
                </div>
              </div>
            </div>
          )
        )
          
          )}
    </div>
    
   </>
  );
};

export default AllVideos;
