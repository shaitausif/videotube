'use client'
import React from 'react'
import CurrentUserProfile from '../../../../components/CurrentUserProfile'

const page = () => {
  return (
    <>
    {/* <Navbar /> */}
      <div className='flex h-full w-[80vw] justify-center mx-auto md:px-12 px-4 py-3'>
      <CurrentUserProfile/>
    </div>
    </>
  )
}

export default page
