"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/features/userSlice/UserSlice";
import { RootState } from "@/store/store";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/App-Sidebar";
import { useSession } from "next-auth/react";
import AllVideos from "../../components/AllVideos";
import { LocalStorage, requestHandler } from "@/utils";
import { getUserInfo, setOauthCustomToken } from "@/lib/apiClient";
import { toast } from "sonner";

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { data: session } = useSession();
  

  // Setting the custom cookies if the user has signed in using oauth providers like google and github
  
    useEffect(() => {
      const timer = setTimeout(() => {
        const isCookieSet = LocalStorage.get("isCookieSet")
      // Only set the custom cookies if the user is logged in Using Oauth Providers such as Github or Google
    if(!isCookieSet && session?.user){
      const setOAuthCustomCookie = async () => {
        
      requestHandler(
        async() => await setOauthCustomToken(),
        null,
        (res) => {
          LocalStorage.set("isCookieSet",true)
        },
        (err) => console.log(err)
      )
    };
    setOAuthCustomCookie();
    }
      }, 2000);
      return () => clearTimeout(timer) // cleanup on unmount
    },[session])
    


  useEffect(() => {
    if (user && user._id) return;
    
    // This localStorage boolean value will help to optimize the performance of app as it will decrease the server calls and will only call if the user has loggedIn
    const isLoggedIn = LocalStorage.get("isLoggedIn")
    if(isLoggedIn){
      const fetchUserData = async () => {
      
      requestHandler(
        async () => await getUserInfo(),
        null,
        (res) => {
          dispatch(setUser(res.data))
        },
        (err) => console.log(err)
      )
    };
    fetchUserData();
    }
    
  }, [session, user]);

  return (
    <>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <header>  
          <nav>
            <Navbar />
          </nav>
        </header>
        <main className="pt-20 md:px-8 px-4 w-full">
          <AllVideos /> 
        </main>
      </SidebarProvider>
    </>
  );
}
