'use client'
import React, { Suspense, useEffect } from 'react'
import UserProfile from '../../../../../components/UserProfile'
import UserProfileSkeleton from '../../../../../components/skeletons/UserProfileSkeleton'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'

const page = () => {
    const params = useParams();
    const user = useSelector((state: RootState) => state.user)
    const router = useRouter();
    


    useEffect(() => {
      if(user.username == params.username){
        router.push('/profile')
        return;
      }
    },[])

  return (
    <div className='flex h-full w-[80vw] justify-center mx-auto md:px-12 px-4 py-3'>
      <Suspense fallback={<UserProfileSkeleton />}>
        <UserProfile username={params.username?.toString()}/>
      </Suspense>
    </div>
  )
}

export default page
