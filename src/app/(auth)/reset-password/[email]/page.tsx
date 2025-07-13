"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import VerifyCode from "../../../../../components/VerifyCode";
import ChangePassword from "../../../../../components/ChangePassword";
import { motion, AnimatePresence , easeIn } from "motion/react"


const Page = () => {
  const params = useParams();
  const email = decodeURIComponent(params.email as string);
  const [isVerified, setisVerified] = useState(false)

    const ChangeVerify = (value: boolean):void => {
        setisVerified(value)
    }

  return (
    <>
      <div className="flex justify-center w-full items-center py-12">
        <div className="w-fit md:mx-auto mx-4 md:w-[35vw] flex flex-col gap-5 justify-center">
        <VerifyCode email={email} redirect={false} verify={isVerified} setverify={ChangeVerify} />
        <AnimatePresence >  
        {
            isVerified && <motion.div
            initial={{opacity : 0, y: -100 }}
            animate={{opacity : 1, y: 0, scale: 1, transition: {duration : 0.5, ease: easeIn , type : "spring", stiffness : 100}}}
            exit={{opacity : 0}}><ChangePassword email={email} /></motion.div>
        } 
        </AnimatePresence>
        </div>
    </div>
    </>
  );
};

export default Page;