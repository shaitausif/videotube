'use client'
import Image from 'next/image'
import React from 'react'
import { Button } from '@/components/ui/button'
import {  EllipsisVertical, MessageSquareMore, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { persistor, RootState } from '@/store/store'
import { clearUser } from '@/features/userSlice/UserSlice'
import ThemeSwitcher from './ThemeSwitcher'
import { SidebarTrigger } from '@/components/ui/sidebar'


const Navbar = () => {

  const user = useSelector((state: RootState) => state.user)  
  const {data : session} = useSession()
  const dispatch = useDispatch();
  const router = useRouter();
  

  const Logout = async() => {
        try {

            const response = await fetch("/api/auth/logout",{
                method : "PUT",
                credentials: "include"
            })
            const data = await response.json()
            if(response.ok){
                
                toast.success(data.message);
                window.location.reload()
                // Using persistor to clear the redux store completely and purging
                // Purge persisted state
               await persistor.purge();
               router.push("/")
                return;
            }
            toast.error(data.message)
        } catch (error) {
            console.log("Error",error)
        } 

    }



  return (
    <div className='md:w-full py-4 fixed dark:bg-[#161616]/50 flex pr-12 pl-6 justify-between items-center backdrop-blur-3xl z-10'>

        {/* Logo */}
        
      <div className='flex justify-center items-center gap-6'>
        <SidebarTrigger />
        <Image src={"/Logo.png"} alt='Logo' width={40} height={40}  />
      </div>
      
      {/* Search Bar */}
      <div className='ml-8 md:block hidden w-100 relative'>
        <Input name='search' className='rounded-2xl' />
        <Search className='absolute top-1.5 right-2.5 w-4 dark:bg-[#161616]/50 cursor-pointer' />
      </div>

        {/* Profile Icon and create button */}
        <div className='flex gap-9 justify-center items-center'>
            {user && user._id ? (
              <Button className='rounded-2xl'><Plus/>{" "}Create</Button>
            ) : (
              <Button onClick={() => router.push("/sign-in")} className='rounded-2xl'><Plus/>{" "}Sign in</Button>
            )}
            {user && user._id && (
              <div className='p-2 rounded-full hover:dark:bg-gray-700 hover:shadow-2xl duration-300'>
                <MessageSquareMore onClick={() => router.push("/chat")} />
              </div>
            )}            
             <DropdownMenu >
      <DropdownMenuTrigger asChild>
        <Button variant={'outline'} className='rounded-full relative w-10 h-10 p-0'>{
          user && user._id ? (
            <Image className='rounded-full object-cover'  src={user.avatar ||"/AltProfile.png"} alt='Profile Icon' fill />
          ) : <EllipsisVertical />
          }</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 dark:bg-[#161616]/50" align="start">
        {user && user._id && <DropdownMenuLabel className='cursor-default'>My Account</DropdownMenuLabel>}
        {
          user && user._id ? (
            <DropdownMenuGroup>
          <DropdownMenuItem onClick={(e) => {
            e.preventDefault()
            router.push("/profile")

          }}>
            Profile
    
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
   
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
   
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <div>
              <ThemeSwitcher />
            </div>
     
          </DropdownMenuItem>
        </DropdownMenuGroup>
          ) : (
            <DropdownMenuGroup>
         
          <DropdownMenuItem>
            Settings
   
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <div>
              <ThemeSwitcher />
            </div>
     
          </DropdownMenuItem>
        </DropdownMenuGroup>
          )
        }
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className='dark:bg-[#161616]/50'>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
   
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        {
          user && user._id ? (
            <DropdownMenuItem onClick={async(e) => {
              e.preventDefault()
              if(session?.user){
                const purgeRes = await persistor.purge();
                console.log(purgeRes)
                signOut({callbackUrl : "/"})
                
              }else{
                Logout()

              }
        }}>
          Logout

        </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => {
          router.push("/sign-in")
        }}>
          Sign in

        </DropdownMenuItem>
          )
        }
      </DropdownMenuContent>
    </DropdownMenu>
        </div>

    </div>
  )
}

export default Navbar
