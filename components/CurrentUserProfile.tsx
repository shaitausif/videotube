"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { Edit, MoreHorizontal } from "lucide-react";
import { setUser } from "@/features/userSlice/UserSlice";
import { requestHandler } from "@/utils";
import {
  editAvatar,
  editCoverImage,
  getUserSubscriberCount,
  toggleAcceptMessages,
} from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import UserVideos from "./user/UserVideos";
import UserPosts from "./user/UserPosts";
import UserTweets from "./user/UserTweets";
import UserPlaylists from "./user/UserPlaylists";
import ProfileInfoModal from "./ProfileInfoModal";


const CurrentUserProfile = () => {
  const user = useSelector((state: RootState) => state?.user);
  const [subscribersCount, setsubscribersCount] = useState(0);
  const [subscribedToCount, setsubscribedToCount] = useState(0)
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
  const coverImageFileInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setavatarLoading] = useState(false);
  const [coverImageLoading, setcoverImageLoading] = useState(false);
  const [activeTab, setactiveTab] = useState<"Home" | "Videos" | "Playlists" | "Posts" | "Tweets">("Home")
  const router = useRouter()

  useEffect(() => {
    const fetchUserSubscriberCount = async () => {
      requestHandler(
        async () => await getUserSubscriberCount(),
        null,
        (res) => {
          setsubscribersCount(res.data.subscribersCount);
          setsubscribedToCount(res.data.subscribedToCount)
        },
        (err) => toast.error(err)
      );
    };
    fetchUserSubscriberCount();
  }, []);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if(!file?.type.startsWith("image")){
      toast.error("Please provide a valid image file")
      return;
    }
    if (file) {
      handleEditAvatar(file); // Call the API function with the new file
    }
  };

  const handleCoverImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;

    if(!file?.type.startsWith("image")){
      toast.error("Please provide a valid image file")
      return;
    }
    if (file) {
      console.log("File found");
      handleEditCoverImage(file);
    }
  };

  const handleEditCoverImage = async (file: File) => {
    requestHandler(
      async () => await editCoverImage(file),
      setcoverImageLoading,
      (res) => {
        toast.success("CoverImage updated successfully!");
        console.log(res);
        dispatch(setUser({ coverImage: res.data }));
      },
      (err) => toast.error(err)
    );
  };

  const handleEditAvatar = async (file: File) => {
    requestHandler(
      async () => await editAvatar(file),
      setavatarLoading,
      (res) => {
        toast.success("Avatar updated successfully!");
        dispatch(setUser({ avatar: res.data }));
        console.log(res);
      },
      (err) => toast.error(err)
    );
  };



  const handleToggleAcceptMessages = async() => {
    requestHandler(
     async() => await toggleAcceptMessages(),
     null,
     (res) => {
      dispatch(setUser({
        isAcceptingMessages : res.data
      }))
      console.log(res)
     },
     (err) => {
      //@ts-ignore
      toast.error(err.message)
     } 
    )
  }




  // This function triggers the hidden file input click
  const triggerAvatarFileInput = () => {
    fileInputRef.current?.click();
  };
  const triggerCoverImageFileInput = () => {
    console.log("triggered");
    coverImageFileInputRef.current?.click();
  };

  const placeholderAvatar =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfj3Bm37Nn_rBQHkIzxnpmGMv3AnLWNYvA1_GwXzebfQ7rxLHl0fRsKo6mIi1SmoOiCL4&usqp=CAU";
  const placeholderCover =
    "https://craftsnippets.com/articles_images/placeholder/placeholder.jpg";

  return (
    <div className="flex gap-5 flex-col">
      {/* CoverImage */}
      <div className="w-[85vw] h-[18vw] aspect-video relative flex justify-end items-end group transition-all duration-300">
        <div
          className="absolute bg-black/50 text-white flex justify-center items-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer bottom-5 right-5  z-10"
          onClick={triggerCoverImageFileInput}
        >
          <button className="flex justify-center items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-3xl shadow-lg shadow-purple-500/25 transition-all duration-300">
            <span className="text-xl">Edit</span>
            <Edit />
          </button>
        </div>

        <input
          type="file"
          ref={coverImageFileInputRef}
          onChange={handleCoverImageFileChange}
          accept="image/*"
          className="hidden"
          disabled={coverImageLoading}
        />
        {coverImageLoading ? (
          <div className="w-full h-full flex justify-center items-center">
            <div className="animate-spin relative">
              <div className="absolute top-2 h-[40px] w-[40px] border-[5px] border-purple-500 rounded-full border-t-[5px] border-t-pink-500 animate-spin"></div>
              <div className="absolute bottom-2 h-[40px]  w-[40px] border-[5px] border-purple-500 rounded-full border-t-[5px] border-t-pink-500 animate-spin"></div>
              <div className="absolute top-2 right-4 h-[40px] w-[40px] border-[5px] border-purple-500 rounded-full border-t-[5px] border-t-pink-500 animate-spin"></div>
              <div className="absolute bottom-2  right-5 h-[40px]  w-[40px] border-[5px] border-purple-500 rounded-full border-t-[5px] border-t-pink-500 animate-spin"></div>
            </div>
          </div>
        ) : (
          <Image
            alt="Cover Image"
            className="object-cover rounded-2xl group-hover:opacity-80 transition-all duration-300"
            src={user.coverImage || placeholderCover} // Provide a fallback
            fill
          />
        )}
      </div>

      <div className="w-full flex">
        {/* User profile Icon */}
        <div className="relative flex justify-center items-center group transition-all duration-300 w-[180px] h-[180px] rounded-full">
          <div
            className="absolute inset-0 bg-black/50 text-white flex justify-center items-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-10"
            onClick={triggerAvatarFileInput}
          >
            <Edit />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarFileChange}
            accept="image/*"
            className="hidden"
            disabled={avatarLoading}
          />

          {
            avatarLoading ? (
              <div className="w-full h-full flex justify-center items-center">
            <div className="animate-spin relative">
              <div className="absolute top-2 h-[40px] w-[40px] border-[5px] border-purple-500 rounded-full border-t-[5px] border-t-pink-500 animate-spin"></div>
              <div className="absolute bottom-2 h-[40px]  w-[40px] border-[5px] border-purple-500 rounded-full border-t-[5px] border-t-pink-500 animate-spin"></div>
              <div className="absolute top-2 right-4 h-[40px] w-[40px] border-[5px] border-purple-500 rounded-full border-t-[5px] border-t-pink-500 animate-spin"></div>
              <div className="absolute bottom-2  right-5 h-[40px]  w-[40px] border-[5px] border-purple-500 rounded-full border-t-[5px] border-t-pink-500 animate-spin"></div>
            </div>
          </div>
            ) : (
              <Image
            alt="User Profile Image"
            className="object-cover rounded-full group-hover:opacity-60 transition-all duration-300"
            fill
            src={user.avatar || placeholderAvatar} // Provide a fallback
          />
            )
          }
        </div>

        <div className="px-6 py-2 flex flex-col gap-1">
          {/* Additional user information */}
          <span className="text-4xl font-semibold">{user.fullName}</span>
          <span className="">
            @{user.username} • {subscribersCount}{" "}
            {subscribersCount > 1 ? "Subscribers" : "Subscriber"}
          </span>
          <p onClick={() => router.push(`/subscription/${user._id}`)} className="ml-2 hover:text-purple-500 dark:hover:text-purple-400 cursor-pointer transition-all duration-300 text-gray-600 dark:text-gray-300">
            {subscribedToCount}{" "}
              {subscribersCount.toString().length > 1
                ? "Subscriptions"
                : "Subscription"}
                
          </p>
                <div className="flex items-center gap-3 mt-1 ml-4">
                  <Switch 
                  onCheckedChange={handleToggleAcceptMessages}
                  checked={user.isAcceptingMessages!}
                  id="accept-messages" />
                  <Label htmlFor="accept-messages" className="hover:text-purple-500 text-gray-500 dark:text-gray-300 transition-colors duration-200">Accept Messages</Label>

                  {/* More Info (ellipsis) */}
                  <ProfileInfoModal
                    fullName={user.fullName}
                    username={user.username}
                    bio={user.bio}
                    socialLinks={user.socialLinks}
                    subscribersCount={subscribersCount}
                  >
                    <button
                      className="p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </ProfileInfoModal>
                </div>
        </div>
        
      </div>
       {/* Section Bar to show home, videos, posts and tweets of the User */}
      <div className="px-4 rounded-lg md:px-12 flex items-center gap-12 md:text-lg">
        {["Home", "Videos", "Playlists", "Posts", "Tweets"].map((item) => (
          <span
          onClick={() => {
            //@ts-ignore
            setactiveTab(item)
          }}
          key={item} className="cursor-pointer relative pb-2 group">
            <span className={` ${activeTab === item ? 'text-foreground font-medium' : "text-gray-500 dark:text-gray-400"}`}>{item}</span>
            <span className={`absolute left-0 bottom-0 w-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out group-hover:w-full group-hover:shadow-[0_0_8px_2px_rgba(168,85,247,0.4)] ${activeTab === item ? 'shadow-[0_0_8px_2px_rgba(168,85,247,0.4)] w-full' : ''}`}></span>
          </span>
        ))}
      </div>

      <hr />
        { activeTab === 'Home' && (
          <div className="flex justify-center items-center w-full h-[30vh]">Home</div>
        )}

        { activeTab === 'Videos' && (
          <UserVideos userId={user._id?.toString()!} /> 
        )}
        { activeTab === 'Playlists' && (
          <UserPlaylists userId={user._id?.toString()!} />
        )}
        { activeTab === 'Posts' && (
          <UserPosts userId={user._id?.toString()!} />
        )}
        { activeTab === 'Tweets' && (
          <UserTweets userId={user._id?.toString()!} />
        )}
    </div>
  );
};

export default CurrentUserProfile;
