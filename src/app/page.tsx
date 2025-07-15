'use client'

import React, { useEffect, useState } from "react";
import LogoutButton from "../../components/LogoutButton";
import Navbar from "../../components/Navbar";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/userSlice/UserSlice";
import { toast } from "sonner";

export default function Home() {

  const dispatch = useDispatch();



  useEffect(() => {
      const fetchUserData = async() => {
      try {
        const response = await fetch("/api/auth/get-user-info",{
        method : "GET",
        credentials : "include"
      })
      const data = await response.json();
      if(!data.success){
        toast(data.message)
        return;
      }

      dispatch(setUser(data.data))  
      } catch (error) {
        console.log(error)
      }

    }
    fetchUserData();
  }, )
  
    

    
  

  return (

    <>
    <header>
      <nav>
        <Navbar />
      </nav>
    </header>
    <main className="pt-20">

 
        <LogoutButton />
    </main>
    </>
  );
}
