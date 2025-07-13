"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import VerifyCode from "../../../../../components/VerifyCode";
import ChangePassword from "../../../../../components/ChangePassword";


const Page = () => {
  const params = useParams();
  const email = decodeURIComponent(params.email as string);


  return (
    <>
      <div className="flex justify-center w-full items-center py-12">
        <div className="w-fit md:mx-auto mx-4 md:w-[35vw] flex flex-col gap-5 justify-center">
        <VerifyCode email={email} redirect={true}  />
        
        </div>
    </div>
    </>
  );
};

export default Page;