"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
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
import { LocalStorage, requestHandler } from "@/utils";

const DynamicModal = dynamic(() => import("./user/UploadContentModal"), {
  ssr: false,
});

import {
  getVideosByQuery,
  updateSearch,
  userSearchHistory,
} from "@/lib/apiClient";

const Navbar = () => {
  const user = useSelector((state: RootState) => state.user);
  const { data: session } = useSession();
  const [isModalOpen, setisModalOpen] = useState(false);
  const [isSearchModalOpen, setisSearchModalOpen] = useState(false);
  const [searchQuery, setsearchQuery] = useState("");
  const [query, setquery] = useState([])
  const [videos, setvideos] = useState([]);
  const [searchHistory, setsearchHistory] = useState<any[]>([]);
  const router = useRouter();

  // Fetch search history only on first mount
  useEffect(() => {
    const getUserSearchHistory = async () => {
      if(!user._id) return;
      requestHandler(
        async () => await userSearchHistory(),
        null,
        (res) => {
          
          if (res.success) {
            setsearchHistory(res.data.searches);
          }
        },
        (err) => {
          // @ts-ignore
          toast.error(err.message);
        }
      );
    };
    getUserSearchHistory();
  }, []);

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

  // Using debouncing to search for the queries
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const handleUpdateSearch = async () => {
  
    if(searchQuery.length < 2){
      setquery([])
      return;
    }
    // Cancel previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      requestHandler(
        // @ts-ignore
        async () => await updateSearch(searchQuery),
        null,
        (res) => {
          // console.log(res);
          if (!res.data) {
            toast.info("No search results found!");
          
            setquery([])
            return;
          }

          setquery(res.data);
        },
        (err) => {
          // @ts-ignore
          toast.error(err.message);
        }
      );
    }, 800);
  };

  const handleGetSearchedVideos = () => {
    if (searchQuery.trim() == "") {
      return toast.info("Please enter search query");
    }
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setisSearchModalOpen(false);
    setquery([]);
  };

  return (
    <>
      <AnimatePresence>
        {isModalOpen && <DynamicModal onClose={() => setisModalOpen(false)} />}
      </AnimatePresence>
      <div className="w-full px-4 mx-auto py-4 fixed bg-white/80 dark:bg-gray-950/80 flex md:pr-12 md:pl-6 justify-between items-center backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 z-20">
        {/* Logo */}

        <motion.div
          animate={{
            x: 0,
          }}
          initial={{
            x: -100,
          }}
          className="flex justify-center items-center gap-6"
        >
          <SidebarTrigger />
          <Image src={"/Logo_2.png"} className="dark:hidden" alt="Logo" width={120} priority height={40} />
          <Image src={"/Logo_dark.png"} className="hidden dark:block" alt="Logo" width={120} priority height={40} />
        </motion.div>

        {/* Search Bar */}
        <div className="ml-8 md:block hidden w-110 relative">
          <AnimatePresence>
            {isSearchModalOpen && (
              <div className="absolute w-full bg-white dark:bg-gray-900 rounded-xl top-9 py-2 border border-gray-200 dark:border-gray-700/50 shadow-xl dark:shadow-purple-500/5">
                { 
                      query.length === 0 ?(
                        searchHistory.length > 0 ? (
                        
                  searchHistory.map((search, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                      }}
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setsearchQuery(search);
                        setisSearchModalOpen(false);
                      }}
                      className="px-4 pointer-events-auto rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10 h-10 cursor-pointer transition-colors duration-200"
                    >
                      <p><span>{search}</span></p>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    animate={{
                      height: 'auto',
                      opacity: 1,
                    }}
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    className=" flex justify-center w-full h-[10vh] items-center"
                  >
                    No searches found
                  </motion.div>
                )
                      ) : (
                      
                  query.map((search, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                      }}
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setsearchQuery(search);
                        setisSearchModalOpen(false);
                      }}
                      className="px-4 rounded-lg hover:bg-purple-50 cursor-pointer dark:hover:bg-purple-500/10 h-10 transition-colors duration-200"
                    >
                      {search}
                    </motion.div>
                  ))
               
                      )

                }
              </div>
            )}
          </AnimatePresence>

          <Input
            onFocus={() => setisSearchModalOpen(true)}
            onBlur={(e) => {
              // Small delay so blur doesn’t instantly close if SearchModal needs a click
              setTimeout(() => {
                setisSearchModalOpen(false);
              }, 100);
            }}
            autoComplete="off"
            value={searchQuery}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                handleGetSearchedVideos();
              }
            }}
            onChange={(e) => {
              setsearchQuery(e.target.value);
              handleUpdateSearch();
            }}
            placeholder="Search"
            name="search"
            className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200"
          />
          <Search
            onClick={() => handleGetSearchedVideos()}
            className="absolute top-[1.4px] bg-gradient-to-r from-purple-500 to-pink-500 text-white h-[90%] px-2 rounded-r-2xl right-0 w-8 cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          />
        </div>

        {/* Profile Icon and create button */}
        <motion.div
          animate={{
            x: 0,
            opacity: 1,
          }}
          initial={{
            x: 100,
            opacity: 0,
          }}
          className="flex gap-4 md:gap-9 justify-center items-center"
        >
          {user && user._id ? (
            <Button
              onClick={() => setisModalOpen(true)}
              className="rounded-full md:rounded-2xl gradient-btn"
            >
              <Plus />
              <span className="md:block hidden">Create</span>
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/sign-in")}
              className="md:rounded-2xl rounded-full gradient-btn"
            >
              <Plus />
              <span className="md:block hidden">Sign in</span>
            </Button>
          )}
          <Search className="md:hidden block text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 cursor-pointer transition-colors duration-200" />
          {user && user._id && (
            <div className="p-2 md:block hidden rounded-full hover:bg-purple-50 hover:dark:bg-purple-500/10 hover:shadow-lg duration-300 transition-all">
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
              className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 shadow-xl dark:shadow-purple-500/5"
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
                  {user?.subscription?.active ? (
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => router.push("/upgrade")}>
                      Upgrade
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <div>
                      <ThemeSwitcher />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              ) : (
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
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
                    <DropdownMenuSubContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/50 shadow-xl">
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
