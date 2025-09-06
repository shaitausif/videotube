import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const SubscriptionSkel = () => {
  return (
    <>
    
      <div  className={`flex w-full items-center relative gap-5`}>
        
    
      <Skeleton className={`h-[100px] rounded-full w-[100px] `} />
      <div className='flex flex-col gap-2'>
              <Skeleton className={`h-[12px] rounded-full w-[160px] `} />
                  <Skeleton className={`h-[10px] rounded-full w-[120px] `} />
                  <Skeleton className={`h-[10px] rounded-full w-[100px] `} />
                  

      </div>
    <div className='absolute right-4 top-4'>
    <Skeleton className={`h-[10px] rounded-full w-[130px] `} />
    </div>
    </div>
    
    </>
  )
}

export default SubscriptionSkel
