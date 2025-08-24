import { LoaderCircle, LoaderIcon } from 'lucide-react'
import React from 'react'

const Loader = () => {
  return (
    <div className='flex justify-center items-center w-full h-[20vh]'>
      <LoaderCircle className='animate-spin' />
    </div>
  )
}

export default Loader
