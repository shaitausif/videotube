'use client'

import React, { useState } from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {motion} from "motion/react"
import { useDispatch } from 'react-redux';
import { setUser } from '@/features/userSlice/UserSlice';
import { LocalStorage } from '@/utils';




const VerifyCode = ({email, redirect, setverify, verify}: {email: string, redirect: boolean, setverify?: (value: boolean) => void, verify? : boolean}) => {

    
    const [isSubmitting, setisSubmitting] = useState(false)

    const router = useRouter()
    const [code, setcode] = useState("")
    const dispatch = useDispatch()
    

    const onsubmit = async (e: React.FormEvent) => {
  try {
    e.preventDefault();
    setisSubmitting(true);
    if (!code || code.trim().length < 1) {
      toast.warning("Please Enter the Code");
      return;
    }

    const response = await fetch(`/api/auth/verify-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (data?.success) {
      LocalStorage.set("isLoggedIn",true)
      toast.success(data.message);
      dispatch(setUser(data?.data))
      setverify?.(true); // ✅ update parent state

      if (redirect) {
        router.push("/");
      }
      return;
    }

    toast.error(data.message);
  } catch (error) {
    console.log(error);
  } finally {
    setcode("");
    setisSubmitting(false);
  }
};


  return (
    <div
    
    
    
    className="flex flex-col z-10 justify-between items-center p-6 m-0.5 dark:text-white dark:bg-main bg-white gap-4">
        <h1 className='md:text-xl text-lg'>Verification Code has been sent to {email}</h1>
        <form 
        className="flex flex-col gap-4"
        onSubmit={onsubmit}>
          <InputOTP 
            onChange={(value) => setcode(value)}
            value={code}
            disabled={verify}
            pattern={REGEXP_ONLY_DIGITS} maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Button disabled={isSubmitting || verify}  type='submit'>
            {isSubmitting ? (
                <Loader2 className='animate-spin' />
            ): "Verify OTP" }
        </Button>
        </form>
      </div>
  )
}

export default VerifyCode
