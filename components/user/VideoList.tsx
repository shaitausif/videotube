'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatVideoDuration, requestHandler } from '@/utils';
import WatchHistorySkel from '../skeletons/WatchHistorySkel';
import { VideoInterface } from '@/models/video.model';

interface VideoListProps {
  fetchVideos: () => Promise<any>;
  title?: string;
  successMessage?: string;
  emptyMessage?: string;
}

const VideoList: React.FC<VideoListProps> = ({
  fetchVideos,
  title,
  successMessage = 'Videos fetched successfully.',
  emptyMessage = 'No videos found.',
}) => {
  const [videos, setVideos] = useState<VideoInterface[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const skeleton = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    const getVideos = async () => {
      requestHandler(
        async () => await fetchVideos(),
        setIsLoading,
        (res) => {
          setVideos(res.data.video ? res.data.video : res.data);
          console.log(res.data)
          toast.success(successMessage);
        },
        (err) => toast.error(err)
      );
    };
    getVideos();
  }, [fetchVideos, successMessage]);

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {title && (
        <h2 className="text-lg md:text-2xl font-semibold mb-2 text-center">
          {title}
        </h2>
      )}

      {isLoading ? (
        skeleton.map((skel) => (
          <div key={skel}>
            <WatchHistorySkel />
          </div>
        ))
      ) : videos.length > 0 ? (
        videos.map((video) => (
          <div
            key={video._id as string}
            onClick={() => router.push(`/video/${video._id}`)}
            className="flex gap-3 group hover:bg-purple-50/50 dark:hover:bg-purple-500/5 rounded-2xl w-full md:w-[70vw] p-2 transition-all duration-300 cursor-pointer border border-transparent hover:border-purple-500/10"
          >
            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-[40vw] sm:w-[30vw] md:w-[15vw] h-[25vw] sm:h-[20vw] md:h-[10vw]">
              <span className="absolute z-10 bottom-2 right-2 bg-black/70 text-white text-xs rounded-md px-1 py-0.5">
                {formatVideoDuration(video.duration)}
              </span>
              <Image
                fill
                alt="Video Thumbnail"
                className="object-cover rounded-xl group-hover:opacity-90 transition-all duration-300"
                src={video.thumbnail}
              />
            </div>

            {/* Video Info */}
            <div className="flex flex-col justify-center py-1 w-full overflow-hidden">
              <span className="text-base sm:text-lg md:text-xl font-medium truncate">
                {video.title}
              </span>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold truncate">
                {video.owner.fullName}
                <span className="px-2">{video.views} views</span>
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 overflow-hidden text-ellipsis line-clamp-2">
                {video.description}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="w-full py-12 flex justify-center items-center text-sm sm:text-lg md:text-xl font-semibold">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default VideoList;
