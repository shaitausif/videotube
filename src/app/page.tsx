'use client'

import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/features/userSlice/UserSlice";
import { RootState } from "@/store/store";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../../components/App-Sidebar";
import { useSession } from "next-auth/react";
import { toast } from "sonner";



export default function Home() {

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user)
  const { data : session } = useSession()



   if(!!session?.user){
        console.log("Hi")
        const setOAuthCustomCookie = async() => {
          try {
            const res = await fetch('/api/user/set-custom-cookies',{
              method : "POST",
              credentials : "include"
            })
            const data = await res.json()
            console.log(data.success)
          } catch (error) {
            console.error(error)
          }
      }
      setOAuthCustomCookie()
      }


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
        return;
      }
      dispatch(setUser(data.data))  
      } catch (error) {
        console.log(error)
      } 
    }
    fetchUserData();
  

  },[session, user])

  
  
    


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
