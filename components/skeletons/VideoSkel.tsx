import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const VideoSkel = () => {
  return (
    <div className="md:grid md:grid-cols-3 w-full md:px-8 px-2">
          <div className="md:col-span-2 space-y-3 md:space-y-5">
            {/* First part with two columns width */}
            <div className="flex flex-col md:h-[70vh] w-full  space-y-3 col-span-1">
              <Skeleton className="md:h-[70vh] h-[30vh] w-full md:w-[60vw] md:rounded-xl" />
            </div>
            <div className="space-y-2 ">
              <Skeleton className="h-4 w-[90vw] md:w-[40vw]" />
              <Skeleton className="h-4 w-[80vw]  md:w-[50vw]" />
            </div>
            
            <div className='mt-5 flex justify-between items-center'>
                <div className='flex md:gap-5 gap-3 items-center'>
                  <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-30 rounded-lg" />
                </div>
                <Skeleton className="h-8 md:w-40 w-25 rounded-2xl" />
            </div>
            {/* Second part with 1 column width */}
          </div>
        </div>
  )
}

export default VideoSkel
