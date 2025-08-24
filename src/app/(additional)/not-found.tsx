import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className='flex justify-center items-center flex-col md:gap-6 w-full h-[50vh]'>
      <h2 className='text-gray-400 dark:hover:text-gray-500 transition-all duration-300 text-lg md:text-2xl'>404{" "}Not Found</h2>
      <p className='text-md md:text-xl'>Doesn't exist</p>
      <Link className='text-gray-400 dark:hover:text-gray-500 transition-all duration-300 text-md hover:underline hover:scale-105 md:text-xl' href="/">Return Home</Link>
    </div>
  )
}