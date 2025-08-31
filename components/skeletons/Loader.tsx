import { LoaderCircle, LoaderIcon } from 'lucide-react'
import React from 'react'

const Loader = ({size}: {size? : string}) => {
  return (
    <div className={`flex justify-center items-center w-full h-[20vh]`}>
      <LoaderCircle className={`animate-spin ${size?.trim() ? size : ""}`} />
    </div>
  )
}

export default Loader
