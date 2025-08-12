'use client'
import { getAllVideos } from '@/lib/apiClient'
import { Video, VideoInterface } from '@/models/video.model'
import { requestHandler } from '@/utils'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns';
import { formatDuration } from 'date-fns'



const AllVideos = () => {
    const [videos, setvideos] = useState<VideoInterface[]>([])
    const [loadingVideos, setloadingVideos] = useState(false)
    
    useEffect(() => {
        const fetchAllVideos = async() => {
            requestHandler(
                async() => await getAllVideos(),
                setloadingVideos,
                (res) => {
                    setvideos(res.data)
                    console.log(videos)
                    console.log(res.data[0].thumbnail)
                    toast("Videos fetched successfully.")
                },
                (err) => toast.error(err)
            )
        }
        fetchAllVideos()
    },[])


  return (
    <div className='grid gap-5 grid-cols-3 w-full'>
        {
            videos.map((video) => (
                <div key={video._id as string} className='col-span-1 rounded-lg h-[45vh] bg-gray-500'>
            <div className='w-full object-cover relative h-[60%] '>
                <div className='absolute z-10 bg-black/70 p-1 rounded-md bottom-2 right-5'>
                    {video.duration}
                </div>
                <Image
                src={video.thumbnail || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfj3Bm37Nn_rBQHkIzxnpmGMv3AnLWNYvA1_GwXzebfQ7rxLHl0fRsKo6mIi1SmoOiCL4&usqp=CAU'}
                alt='Video Thumbnail'
                className='object-cover  rounded-t-lg'
                fill
                />
            </div>
            <div className='flex  py-4 px-2 gap-3'>
                {/* Video Owner avatar */}
                <div className='relative w-[32px] h-[32px]'>
                    <Image
                        src={video?.owner?.avatar as string || './public/AltProfile.png'}
                        alt='avatar'
                        className='object-cover object-center rounded-full'
                        fill
                    />
                </div>
                <div className='flex flex-col'>
                    <span className='text-lg'>Title</span>
                    <span className='text-sm text-gray-300'>Author</span>
                    <span className='text-[12px] text-gray-300'>{video.views} views • {formatDistanceToNow(new Date(video.createdAt!),{ addSuffix : true })}</span>
                </div>
                
            </div>
            
        </div>
            ))
        }
        
    </div>
  )
}

export default AllVideos
