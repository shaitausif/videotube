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
      <div className="flex justify-center w-full items-center py-12 pointer-events-auto">
        <div className="w-fit mx-4 md:w-[35vw] flex flex-col gap-5 justify-center items-center">
        <motion.div
        initial={{ opacity: 0, y: -100 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, type: "spring", stiffness: 100 },
          }}
          exit={{ opacity: 0 }}
        className="card-wrapper justify-center flex">
          <VerifyCode  email={email} redirect={false} verify={isVerified} setverify={ChangeVerify} />
        </motion.div>
        <AnimatePresence >  
        {
            isVerified && 
              <div className="w-fit h-fit">
                <motion.div
                initial={{opacity : 0, y: -100 }}
            animate={{opacity : 1, y: 0, scale: 1, transition: {duration : 0.5, ease: easeIn , type : "spring", stiffness : 100}}}
            exit={{opacity : 0}}
                
                className="card-wrapper justify-center items-center flex">
  
              <ChangePassword email={email} />
              
              </motion.div>
              </div>
            
        } 
        </AnimatePresence>
        </div>
    </div>
    </>
  );
};

export default Page;