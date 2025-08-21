import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const VideoSkel = () => {
  return (
    <div className="grid grid-cols-3 w-full md:px-8 px-4">
          <div className="col-span-2 space-y-5">
            {/* First part with two columns width */}
            <div className="flex flex-col h-[70vh] w-full  space-y-3 col-span-1">
              <Skeleton className="h-[70vh] w-[60vw] rounded-xl" />
            </div>
            <div className="space-y-2 px-2">
              <Skeleton className="h-4 w-full md:w-[40vw]" />
              <Skeleton className="h-4 w-full  md:w-[50vw]" />
            </div>

            {/* Second part with 1 column width */}
          </div>
        </div>
  )
}

export default VideoSkel
