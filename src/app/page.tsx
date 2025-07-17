'use client'

import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/features/userSlice/UserSlice";
import { RootState } from "@/store/store";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../../components/App-Sidebar";



export default function Home() {

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user)



  useEffect(() => {

      if(user && user._id) return;

      const fetchUserData = async() => {
      try {
        const response = await fetch("/api/auth/get-user-info",{
        method : "GET",
        credentials : "include"
      })
      const data = await response.json();
      if(!data.success){
        console.log(data.message)
        return;
      }

      dispatch(setUser(data.data))  
      } catch (error) {
        console.log(error)
      } 

    }
    fetchUserData();
  }, [])
  
    


  return (

    <>

    <SidebarProvider defaultOpen={false} >
      
       
      
      <AppSidebar/>
    <header>
      <nav>
        <Navbar />
      </nav>
    </header>
    <main className="pt-20">

 
    </main>
    </SidebarProvider>
    </>
  );
}
