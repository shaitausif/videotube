'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { getWatchHistory } from '@/lib/apiClient'
import { VideoInterface } from '@/models/video.model'
import { toast } from 'sonner'
import { formatVideoDuration, requestHandler } from '@/utils'
import { useRouter } from 'next/navigation'
import WatchHistorySkel from './skeletons/WatchHistorySkel'

const WatchHistory = () => {

    const [videoHistory, setVideoHistory] = useState<VideoInterface[]>([])
    const [isFetchingVideos, setisFetchingVideos] = useState(false)
    const skeleton = [1,2,3,4,5,6]
    const router = useRouter()

    useEffect(() => {
        const fetchHistoryVideos = async() => {
            requestHandler(
                async() => await getWatchHistory(),
                setisFetchingVideos,
                (res) => {
                    setVideoHistory(res.data)
                    toast.success("User Watch History fetched successfully.")
                },
                (err) => toast.error(err)
            )
        }
        fetchHistoryVideos()
    },[])



  return (
   <>
    {
        isFetchingVideos ? (
            skeleton.map((skel) => (
                <div key={skel}>
                    <WatchHistorySkel />
                </div>
            ))
        ) : (
            videoHistory.length > 0 ? (
            videoHistory.map((video) => (
                <div
                onClick={() => router.push(`/video/${video._id}`)}
                key={video._id as string} className='flex gap-4 md:gap-8 group hover:bg-gray-100 dark:bg-gray-800 rounded-2xl w-full md:w-[70vw] dark:hover:bg-gray-900 transition-all duration-300'>
                
                
            <div className='relative h-full w-[25vw] md:w-[15vw] md:h-[10vw]'>
                {/* Thumbnail of the Video */}
                <span className='absolute z-10 bottom-2 right-2 bg-black/70 rounded-md p-1'>{formatVideoDuration(video.duration)}</span>
                <Image
                fill
                alt='Thumbnail of the Video'
                className='object-cover rounded-xl md:rounded-l-xl group-hover:opacity-90 transition-all duration-300'
                src={video.thumbnail}
                /> 
            </div>
            <div className='flex flex-col py-2 md:py-4'>
                {/* Title, Description, Author and more details */}
                <span className='text-xl'>{video.title}</span>
                <span className='text-[15px] text-gray-600 dark:text-gray-400 font-semibold'>{video.owner.fullName}<span className='px-4'>{video.views} views</span></span>
                <span className='dark:text-gray-400 text-gray-600'>{video.description}</span>
            </div>
        </div>
            ))
        ) : (
            <div className='w-full py-12 flex justify-center items-center txt-xl md:text-2xl font-semibold'>
                No Watch History found
            </div>
        )
        )
    }
   </>
  )
}

export default WatchHistory
