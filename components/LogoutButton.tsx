'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { signOut } from 'next-auth/react'

const LogoutButton = () => {
    const router = useRouter()
    const [isSubmitting, setisSubmitting] = useState(false)

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
    <div>
      <Button onClick={() => {
        Logout();
        signOut();
      }}>{isSubmitting ? <Loader2 className='animate-spin'/> : "Logout"}</Button>
    </div>
  )
}

export default LogoutButton
