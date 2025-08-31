'use client'
import React, { useEffect, useState } from 'react'
import AllVideosSkel from './components/skeletons/AllVideosSkel'
import { VideoInterface } from '@/models/video.model'
import { useRouter } from 'next/navigation'
import { formatVideoDuration, requestHandler } from '@/utils'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { getUserVideos } from '@/lib/apiClient'
import { toast } from 'sonner'

const UserVideos = ({userId} : { userId : string}) => {

    const [loadingVideos, setloadingVideos] = useState(false)
    const skeleton = [1,2,3,4,5,6]
    const [videos, setvideos] = useState<VideoInterface[]>([])
    const router = useRouter()


    const getVideos = async() => {
      requestHandler(
        async() => await getUserVideos(userId),
        setloadingVideos,
        (res) => {
          setvideos(res.data)
          console.log(res.data)
        },
        // @ts-ignore
        (err) => toast.error(err.message)
      )
    }

    useEffect(() => {
      getVideos();
    },[])




  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
  {loadingVideos
    ? skeleton.map((skel) => (
        <div key={skel}>
          <AllVideosSkel />
        </div>
      ))
    : videos && videos?.length ? (
        videos.map((video) => (
        <div
          key={video._id as string}
          className="col-span-1 w-full max-w-[300px] rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer  dark:hover:bg-gray-900"
          onClick={() => {
            router.push(`/video/${video._id}`);
          }}
        >
          {/* Thumbnail */}
          <div className="relative w-full h-[150px]">
            <div className="absolute z-10 text-white bg-black/80 px-2 py-1 rounded-md bottom-2 right-2 text-xs">
              {formatVideoDuration(video.duration)}
            </div>
            <Image
              src={
                video.thumbnail ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfj3Bm37Nn_rBQHkIzxnpmGMv3AnLWNYvA1_GwXzebfQ7rxLHl0fRsKo6mIi1SmoOiCL4&usqp=CAU"
              }
              alt="Video Thumbnail"
              className="object-cover rounded-t-lg"
              fill
            />
          </div>

          {/* Details */}
          <div className="p-3 flex flex-col gap-1">
            <span className="text-sm font-semibold line-clamp-2">
              {video.title!}
            </span>

            <span className="text-xs text-gray-600 dark:text-gray-400">
              {video.views} views •{" "}
              {formatDistanceToNow(new Date(video.createdAt!), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      ))
    ) : (
      <div className='flex justify-center items-center col-span-5 h-[30vh]'>No Videos yet.</div>
    )
    
    }
</div>
  )
}

export default UserVideos
