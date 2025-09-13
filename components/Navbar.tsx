"use client";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EllipsisVertical,
  MessageSquareMore,
  Plus,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { persistor, RootState } from "@/store/store";
import ThemeSwitcher from "./ThemeSwitcher";
import { SidebarTrigger } from "@/components/ui/sidebar";
// Using dynamic imports for lazy loading that means the component will only load when it's needed not on initial render of the page
import dynamic from "next/dynamic";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { LocalStorage } from "@/utils";

const DynamicModal = dynamic(() => import("./user/UploadContentModal"), {
  ssr: false,
});

const Navbar = () => {
  const user = useSelector((state: RootState) => state.user);
  const { data: session } = useSession();
  const [isModalOpen, setisModalOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const Logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "PUT",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        await persistor.purge();
        toast.success(data.message);
        window.location.reload();
        LocalStorage.set("isLoggedIn", false);
        // Using persistor to clear the redux store completely and purging
        // Purge persisted state

        //  router.push("/")
        return;
      }
      toast.error(data.message);
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isModalOpen && <DynamicModal onClose={() => setisModalOpen(false)} />}
      </AnimatePresence>
      <div className="w-full px-4 mx-auto py-4 fixed dark:bg-[#161616]/50 flex md:pr-12 md:pl-6 justify-between items-center backdrop-blur-3xl z-20">
        {/* Logo */}

        <motion.div
        animate={{
          x : 0
        }}
        initial={{
          x : -100
        }}
        className="flex justify-center items-center gap-6">
          <SidebarTrigger />
          <Image src={"/Logo.png"} alt="Logo" width={40} priority height={40} />
        </motion.div>

        {/* Search Bar */}
        <div className="ml-8 md:block hidden w-100 relative">
          <Input name="search" className="rounded-2xl" />
          <Search className="absolute top-1.5 right-2.5 w-4 dark:bg-[#161616]/50 cursor-pointer" />
        </div>

        {/* Profile Icon and create button */}
        <motion.div
        animate={{
          x : 0,
          opacity : 1
        }}
        initial={{
          x : 100,
          opacity : 0
        }}
        className="flex gap-4 md:gap-9 justify-center items-center">
          {user && user._id ? (
            <Button
              onClick={() => setisModalOpen(true)}
              className="rounded-full  md:rounded-2xl"
            >
              <Plus />
              <span className="md:block hidden">Create</span>
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/sign-in")}
              className="md:rounded-2xl rounded-full"
            >
              <Plus />
              <span className="md:block hidden">Sign in</span>
            </Button>
          )}
          <Search className="md:hidden block dark:bg-[#161616]/50 cursor-pointer" />
          {user && user._id && (
            <div className="p-2 md:block hidden rounded-full hover:dark:bg-gray-700 hover:shadow-2xl duration-300">
              <MessageSquareMore onClick={() => router.push("/chat")} />
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"outline"}
                className="rounded-full relative w-10 h-10 p-0"
              >
                {user && user._id ? (
                  <Image
                    className="rounded-full object-cover"
                    src={user.avatar || "/AltProfile.png"}
                    alt="Profile Icon"
                    fill
                  />
                ) : (
                  <EllipsisVertical />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 dark:bg-[#161616]/50"
              align="start"
            >
              {user && user._id && (
                <DropdownMenuLabel className="cursor-default">
                  My Account
                </DropdownMenuLabel>
              )}
              {user && user._id ? (
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/profile");
                    }}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="md:hidden block"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/chat");
                    }}
                  >
                    Messages
                  </DropdownMenuItem>
                  {
                    user?.isPaid ? (
                      <DropdownMenuItem>Billing</DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>Upgrade</DropdownMenuItem>
                    )
                  }
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div>
                      <ThemeSwitcher />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              ) : (
                <DropdownMenuGroup>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div>
                      <ThemeSwitcher />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="dark:bg-[#161616]/50">
                      <DropdownMenuItem>Email</DropdownMenuItem>
                      <DropdownMenuItem>Message</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>More...</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem>New Team</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>GitHub</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuItem disabled>API</DropdownMenuItem>
              <DropdownMenuSeparator />
              {user && user._id ? (
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.preventDefault();
                    if (session?.user) {
                      const response = await fetch(`/api/auth/auth-logout`, {
                        method: "PUT",
                        credentials: "include",
                      });
                      if (response.ok) {
                        await persistor.purge();
                        LocalStorage.set("isLoggedIn", false);
                        LocalStorage.set("isCookieSet", false);
                        signOut({ callbackUrl: "/" });
                      }
                    } else {
                      await Logout();
                    }
                  }}
                >
                  Logout
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    router.push("/sign-in");
                  }}
                >
                  Sign in
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </>
  );
};

export default Navbar;
