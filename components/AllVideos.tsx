"use client";
import { getAllVideos } from "@/lib/apiClient";
import { Video, VideoInterface } from "@/models/video.model";
import { formatVideoDuration, requestHandler } from "@/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const AllVideos = () => {
  const [videos, setvideos] = useState<VideoInterface[]>([]);
  const [loadingVideos, setloadingVideos] = useState(false);
  const router = useRouter();
  const skeleton = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    const fetchAllVideos = async () => {
      requestHandler(
        async () => await getAllVideos(),
        setloadingVideos,
        (res) => {
          setvideos(res.data);
          console.log(videos);
          console.log(res.data[0].thumbnail);
          toast.success("Videos fetched successfully.");
        },
        (err) => toast.error(err)
      );
    };
    fetchAllVideos();
  }, []);

  return (
    <div className="md:grid gap-5 grid-cols-3 w-full flex flex-col">
      {loadingVideos
        ? skeleton.map((skel) => (
            <div key={skel} className="flex flex-col h-[45vh] space-y-3 col-span-1">
              <Skeleton className="h-[220px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full md:w-[250px]" />
                <Skeleton className="h-4 w-full  md:w-[200px]" />
              </div>
            </div>
          ))
        : videos.map((video) => (
            <div
              key={video._id as string}
              className="col-span-1 rounded-lg h-[45vh] group hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-900 transition-all duration-300"
              onClick={() => {
                router.push(`/video/${video._id}`);
              }}
            >
              <div className="w-full object-cover relative h-[70%] ">
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
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg">{video.title!}</span>
                  <span className="text-sm text-gray-600 font-semibold dark:text-gray-400">
                    {video.owner.fullName!}
                  </span>
                  <span className="text-[12px] text-gray-600 dark:text-gray-400">
                    {video.views} views •{" "}
                    {formatDistanceToNow(new Date(video.createdAt!), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
    </div>
  );
};

export default AllVideos;
