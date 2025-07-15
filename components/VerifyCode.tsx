'use client'

import React, { useState } from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {motion} from "motion/react"




const VerifyCode = ({email, redirect, setverify, verify}: {email: string, redirect: boolean, setverify?: (value: boolean) => void, verify? : boolean}) => {

    
    const [isSubmitting, setisSubmitting] = useState(false)

    const router = useRouter()
    const [code, setcode] = useState("")
    

    const onsubmit = async (e: React.FormEvent) => {
  try {
    e.preventDefault();
    setisSubmitting(true);
    if (!code || code.trim().length < 1) {
      toast("Please Enter the Code");
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
      toast(data.message);
      setverify?.(true); // ✅ update parent state

      if (redirect) {
        router.push("/");
      }
      return;
    }

    toast(data.message);
  } catch (error) {
    console.log(error);
  } finally {
    setcode("");
    setisSubmitting(false);
  }
};


  return (
    <motion.div
    initial={{ opacity: 0, y: -100 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, type: "spring", stiffness: 100 },
          }}
          exit={{ opacity: 0 }}
    className="flex z-10 flex-col justify-between items-center p-6 rounded-lg dark:bg-[#161616] gap-4">
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
        <Button disabled={isSubmitting} type='submit'>
            {isSubmitting ? (
                <Loader2 className='animate-spin' />
            ): "Verify OTP" }
        </Button>
        </form>
      </motion.div>
  )
}

export default VerifyCode
