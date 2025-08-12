"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import { setUser } from "@/features/userSlice/UserSlice";
import { requestHandler } from "@/utils";
import {
  editAvatar,
  editCoverImage,
  getUserSubscriberCount,
} from "@/lib/apiClient";
import loading from "@/app/loading";

const CurrentUserProfile = () => {
  const user = useSelector((state: RootState) => state?.user);
  const [subscribersCount, setsubscribersCount] = useState(0);
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
  const coverImageFileInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setavatarLoading] = useState(false);
  const [coverImageLoading, setcoverImageLoading] = useState(false);

  useEffect(() => {
    const fetchUserSubscriberCount = async () => {
      requestHandler(
        async () => await getUserSubscriberCount(),
        null,
        (res) => {
          setsubscribersCount(res.data);
        },
        (err) => toast.error(err)
      );
    };
    fetchUserSubscriberCount();
  }, []);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      handleEditAvatar(file); // Call the API function with the new file
    }
  };

  const handleCoverImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    console.log("Hi");
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
      <div className="w-[85vw] h-[18vw] relative flex justify-end items-end group transition-all duration-300">
        <div
          className="absolute bg-black/50 text-white flex justify-center items-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer bottom-5 right-5  z-10"
          onClick={triggerCoverImageFileInput}
        >
          <button className="flex justify-center items-center gap-2 bg-blue-600 px-4 py-2 rounded-3xl">
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
              <div className="absolute top-2 h-[40px] w-[40px] border-[5px] border-blue-500 rounded-full border-t-[5px] border-t-green-500 animate-spin"></div>
              <div className="absolute bottom-2 h-[40px]  w-[40px] border-[5px] border-blue-500 rounded-full border-t-[5px] border-t-green-500 animate-spin"></div>
              <div className="absolute top-2 right-4 h-[40px] w-[40px] border-[5px] border-blue-500 rounded-full border-t-[5px] border-t-green-500 animate-spin"></div>
              <div className="absolute bottom-2  right-5 h-[40px]  w-[40px] border-[5px] border-blue-500 rounded-full border-t-[5px] border-t-green-500 animate-spin"></div>
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
              <div className="absolute top-2 h-[40px] w-[40px] border-[5px] border-blue-500 rounded-full border-t-[5px] border-t-green-500 animate-spin"></div>
              <div className="absolute bottom-2 h-[40px]  w-[40px] border-[5px] border-blue-500 rounded-full border-t-[5px] border-t-green-500 animate-spin"></div>
              <div className="absolute top-2 right-4 h-[40px] w-[40px] border-[5px] border-blue-500 rounded-full border-t-[5px] border-t-green-500 animate-spin"></div>
              <div className="absolute bottom-2  right-5 h-[40px]  w-[40px] border-[5px] border-blue-500 rounded-full border-t-[5px] border-t-green-500 animate-spin"></div>
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
        </div>
      </div>
    </div>
  );
};

export default CurrentUserProfile;
