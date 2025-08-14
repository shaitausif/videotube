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
import { requestHandler } from "@/utils";
import { getUserInfo, setOauthCustomToken } from "@/lib/apiClient";
import { toast } from "sonner";

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { data: session } = useSession();

  // Setting the custom cookies if the user has signed in using oauth providers like google and github
  if (!!session?.user) {
    console.log("Hi");
    const setOAuthCustomCookie = async () => {
     
      requestHandler(
        async() => await setOauthCustomToken(),
        null,
        (res) => {
          console.log(res)
        },
        (err) => console.log(err)
      )
    };
    setOAuthCustomCookie();
  }

  useEffect(() => {
    if (user && user._id) return;

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
