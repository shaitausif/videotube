'use client'
import React from 'react'
import UserProfile from '../../../../components/UserProfile'
import Navbar from '../../../../components/Navbar'

const page = () => {
  return (
    <>
    {/* <Navbar /> */}
      <div className='flex h-full w-full justify-center mx-auto md:px-12 px-4 py-3'>
      <UserProfile/>
    </div>
    </>
  )
}

export default page
