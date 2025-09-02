'use client'
import { useRouter } from 'next/navigation'
import React from 'react'

const TweetMentioned = ({children}: {children : string}) => {

    const router = useRouter()


  return (
    <span
    onClick={() => router.push(`/c/${children.split("@")[1]}`)}
    className='text-blue-500 z-50 hover:text-blue-600 transition-all duration-300 cursor-pointer ' >
      {children}
    </span>
  )
}

export default TweetMentioned
