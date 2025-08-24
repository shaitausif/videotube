"use client";
import { getAllVideos } from "@/lib/apiClient";
import { VideoInterface } from "@/models/video.model";
import { requestHandler } from "@/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "./skeletons/Loader";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { VerifiedIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const SuggestVideos = ({ videoId }: { videoId: string }) => {
  const [fetchingVideos, setfetchingVideos] = useState(false);
  const [videos, setvideos] = useState<VideoInterface[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchAllVideos = async () => {
      requestHandler(
        async () => await getAllVideos(),
        setfetchingVideos,
        (res) => {
          const filterVideos = res.data.filter(
            (video: VideoInterface) => video._id !== videoId
          );
          setvideos(filterVideos);
        },
        (err) => toast.error(err)
      );
    };
    fetchAllVideos();
  }, []);

  return (
    <div className="flex flex-col gap-3 p-2 w-full">
      {fetchingVideos ? (
        <Loader />
      ) : videos.length ? (
        videos.map((video) => (
          <div
            key={video._id as string}
            className="  flex w-full rounded-lg h-[16vh] group hover:bg-gray-100  dark:hover:bg-gray-900 transition-all duration-300"
            onClick={() => {
              router.push(`/video/${video._id}`);
            }}
          >
            {/* Thumbnail */}
            <div className="relative w-[44%] h-full">
              <Image
                alt="Thumbnail"
                className="absolute object-cover rounded-lg"
                src={video.thumbnail}
                fill
              />
            </div>
            {/* Title and channel Info */}
            <div className="flex flex-col py-1 px-3">
              <p className="text-[15px] font-semibold">
                {video.title.length > 50
                  ? video.title.slice(0, 50) + "..."
                  : video.title}
              </p>
              <p className="text-[13px] text-gray-400 flex items-center gap-1">
                {video.owner.fullName}
                <VerifiedIcon className="w-4" fill="gray" color="black" />
              </p>
              <p className="text-[13px] text-gray-400">
                <span>{video.views} views • </span>
                <span>
                  {formatDistanceToNow(new Date(video.createdAt!), {
                    addSuffix: true,
                  })}
                </span>
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="flex justify-center items-center h-[10vh]">
          No Videos to show
        </div>
      )}
    </div>
  );
};

export default SuggestVideos;
