'use client'
import React from 'react'

import { getLikedVideos } from '@/lib/apiClient'
import VideoList from '../../../../components/user/VideoList'


const Page = () => {
    


  return (
    <main className='w-full h-full flex md:gap-4 gap-2 flex-col md:px-8 px-4 md:py-4 py-2'>
        <VideoList
      fetchVideos={getLikedVideos}
      title="Your Liked Videos"
      successMessage="Liked videos loaded successfully."
      emptyMessage="No Liked videos found."
    />
    </main>
  )
}

export default Page
