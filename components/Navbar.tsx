'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Loader2, Plus, Search } from 'lucide-react'
import { Input } from './ui/input'
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
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'


const Navbar = () => {


  const user = useSelector((state: RootState) => state.user)  
  console.log(user.avatar)
  const [isSubmitting, setisSubmitting] = useState(false)
  const router = useRouter();

  const Logout = async() => {
        try {
            setisSubmitting(true)
            const response = await fetch("/api/auth/logout",{
                method : "PUT",
                credentials: "include"
            })
            const data = await response.json()
            if(data.success){
                toast(data.message)
                router.push("/sign-in")
                return;
            }
            toast(data.message)
        } catch (error) {
            console.log("Error",error)
        } finally {
            setisSubmitting(false)
        }

    }



  return (
    <div className='w-full py-4 fixed dark:bg-[#161616]/50 flex px-12 justify-between items-center backdrop-blur-3xl'>

        {/* Logo */}
      <div>
        <Image src={"/Logo.png"} alt='Logo' width={40} height={40}  />
      </div>
      
      {/* Search Bar */}
      <div className='ml-8 md:block hidden w-100 relative'>
        <Input className='rounded-2xl' />
        <Search className='absolute top-1.5 right-2.5 w-4 dark:bg-[#161616]/50 cursor-pointer' />
      </div>

        {/* Profile Icon and create button */}
        <div className='flex gap-12 justify-center items-center'>
            <Button className='rounded-2xl  '><Plus/>{" "}Create</Button>
            
             <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'outline'} className='rounded-full w-10 h-10 p-0'><Image className='rounded-full' src={user.avatar ||"/Logo.png"} alt='Profile Icon' height={40} width={40} /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          Logout();
          signOut();
        }}>
          {isSubmitting ? <Loader2 className='animate-spin'/> : "Logout"}
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
        </div>

    </div>
  )
}

export default Navbar
