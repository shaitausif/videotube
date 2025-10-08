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
import useFcmToken from "./hooks/useFcmToken";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const DynamicModal = dynamic(() => import("../../components/user/SubExpiryModal"))


export default function Home() {
  const dispatch = useDispatch();
  
  const user = useSelector((state: RootState) => state.user!);
  const { data: session } = useSession();
   const searchParams = useSearchParams();
   const router = useRouter();
   const [isExpireModalOpen, setisExpireModalOpen] = useState(false)



   useEffect(() => {
    if (searchParams.get("paymentdone") == "true") {
      setTimeout(() => {
        toast.success("You are now a Premium User, Enjoy the amazing features!")
        fetchUserData()
        router.push('/')
      }, 3000); 
    }
  }, []);

  

  // This hook is specifically responsible for managing the user's Authentication by verifying the user token after an spefic interval, Like if the tokens have been expired then it will automatically delete the users data from their LocalStorage and redux store
  useEffect(() => {
    if(user && user._id){
        const verifyAuth = async () => {
    try {
      const res = await fetch("/api/user/verify", { credentials: "include" });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        // If token expired or invalid
        dispatch(setUser(null));
        LocalStorage.remove("isLoggedIn");
        LocalStorage.remove("isCookieSet");
        toast.error("Session expired, please log in again.");
      }
    } catch (err) {
      console.error("Error verifying token:", err);
    }
  };
    verifyAuth();
  const interval = setInterval(verifyAuth, 5 * 60 * 1000); // every 5 minutes
  return () => clearInterval(interval);
    }


}, []);


  
  // This useEffect is responsible for setting up the user FCM registration token in the user's database

  // As hooks can't be called inside hooks
  const { token , notificationPermissionStatus } = useFcmToken()
    useEffect(() => {
      if(user._id && token && notificationPermissionStatus == 'granted'){
        
        const isFcmToken = LocalStorage.get("FcmToken")
      // If the generated token is different from the token in the LocalStorage then update the token in the database as well
      if(isFcmToken !== token || !isFcmToken){
         const setFCMTokens = async() => {
        const response = await fetch(`/api/user/set-fcm-token`,{
          method : "POST",
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify({token}),
          credentials : 'include'
        })
        if(response.ok){
          LocalStorage.set("FcmToken",token)
          const result = await response.json()
       
        }
      }
      setFCMTokens()
      }
      }
      
  
    
    },[token])


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



    
    const fetchUserData = async () => {

      requestHandler(
        async () => await getUserInfo(),
        null,
        (res) => {
          dispatch(setUser(res.data))

          if(res.isPlanExpired){
            
            setTimeout(() => {
              setisExpireModalOpen(true)
            }, 3000);
          }
        },
        (err) => console.log(err)
      )
    };

  useEffect(() => {
    if (user && user._id) return;
    
    // This localStorage boolean value will help to optimize the performance of app as it will decrease the server calls and will only call if the user has loggedIn
    const isLoggedIn = LocalStorage.get("isLoggedIn")
    if(isLoggedIn){
      
    fetchUserData();
    }
    
  }, [session, user]);





  return (
    <>
    {
      isExpireModalOpen && (
        <DynamicModal onClose={() => setisExpireModalOpen(false)} />
      )
    }
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
        <BackgroundBeams />
      </SidebarProvider>
    </>
  );
}
