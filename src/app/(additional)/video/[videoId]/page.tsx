'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { VideoInterface } from '@/models/video.model'
import { requestHandler } from '@/utils'
import { getVideoById } from '@/lib/apiClient'
import { toast } from 'sonner'



const page = () => {
    const params = useParams()
    const [video, setvideo] = useState({})
    

    useEffect(() => {
        const getVideoInfo = async () => {
            requestHandler(
                async () => await getVideoById(params.videoId),
                null,
                (res) => {
                    setvideo(res.data)
                },
                (err) => toast.error(err)
            )
        }
        getVideoInfo()
    },[])


  return (
    <div className='flex justify-center'>
        
    </div>
  )
}

export default page
