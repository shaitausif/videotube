import React from 'react'


const loading = () => {
  return (
    <div className='h-[100vh]  flex justify-center items-center'>
      <div className='animate-spin relative'>
        <div className='absolute top-2 h-[60px] w-[60px] border-[10px] border-blue-500 rounded-full border-t-[10px] border-t-green-500 animate-spin'>
      </div>
      <div className='absolute bottom-2 h-[60px]  w-[60px] border-[10px] border-blue-500 rounded-full border-t-[10px] border-t-green-500 animate-spin'>
      </div>
        <div className='absolute top-2 right-4 h-[60px] w-[60px] border-[10px] border-blue-500 rounded-full border-t-[10px] border-t-green-500 animate-spin'>
      </div>
      <div className='absolute bottom-2  right-5 h-[60px]  w-[60px] border-[10px] border-blue-500 rounded-full border-t-[10px] border-t-green-500 animate-spin'>
      </div>
      </div>
    </div>
  )
}

export default loading
