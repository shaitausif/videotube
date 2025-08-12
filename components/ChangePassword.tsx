'use client'
import React, { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { z } from 'zod'
import { ResetPasswordSchema } from '@/schemas/ResetPasswordSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const ChangePassword = ({email}: {email: string}) => {
    const [isSubmitting, setisSubmitting] = useState(false)
    const [isPasswordVisible, setisPasswordVisible] = useState(false)
    const router = useRouter()


    const onsubmit = async(data: z.infer<typeof ResetPasswordSchema>) => {
      try {
        setisSubmitting(true)
        if(data.password !== data.confirmPassword){
          toast("Passwords do not match")
          return;
        }
        const {password} = data
        const response = await fetch("/api/auth/reset-password",{
          method : "PUT",
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify({email, password})
        })
        const dataa = await response.json()
        if(dataa.success){
          toast.success(dataa.message)
          router.replace("/sign-in")            
          form.reset()
          return;
        }
        toast.error(dataa.message)
        form.reset();
      }  catch (error) {
          console.log(error)
      } finally {
        setisSubmitting(false)
      }
    }

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
      resolver : zodResolver(ResetPasswordSchema),
      defaultValues : {
        password : "",
        confirmPassword : ""
      }
    })





  return (
    <div className="flex flex-col justify-between items-center p-6 rounded-lg dark:bg-[#161616] gap-4">
        <h1 className='md:text-xl text-lg'>Create New Password</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onsubmit)} className='w-full flex flex-col items-center gap-3 text-center'>
          <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className=" relative">
                              <Input
                                className="md:w-[25vw] placeholder:text-[#A1A1A1]"
                                placeholder="Enter the Password"
                                type={isPasswordVisible ? "text" : "password"}
                                {...field}
                              />
                              {isPasswordVisible ? (
                                <Eye onClick={() => setisPasswordVisible(false)} className="right-2 opacity-50 w-4 absolute top-1.5" />
                              ) : (
                                <EyeOff onClick={() => setisPasswordVisible(true)} className="right-2 opacity-50 w-4 absolute top-1.5" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
          <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                className="md:w-[25vw] placeholder:text-[#A1A1A1]"
                                placeholder="Confirm the Password"
                                type="password"
                                {...field}
                              />
                              
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
          
          <Button type='submit' disabled={isSubmitting} className='mt-1'>
            {isSubmitting ? (
              <Loader2 className='animate-spin' />
            ): "Submit"}
          </Button>
        </form>
        </Form>
        
      </div>
  )
}

export default ChangePassword
