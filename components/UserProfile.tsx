'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import { Edit } from 'lucide-react';
import { setUser } from '@/features/userSlice/UserSlice';

const UserProfile = () => {
  const user = useSelector((state: RootState) => state?.user);
  const [subscribersCount, setsubscribersCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State to hold the File object
  const [coverImageFile, setcoverImageFile] = useState<File | null>(null)
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
  const coverImageFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserChannelInfo = async () => {
      try {
        const res = await fetch(`/api/user/get-current-user-subscriber-count`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setsubscribersCount(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscriber count:', error);
      }
    };
    fetchUserChannelInfo();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      handleEditAvatar(file); // Call the API function with the new file
    }
  };

  const handleCoverImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if(file){
      setSelectedFile(file)
      handleEditCoverImage(file)
    }
  }


  const handleEditCoverImage = async(file: File) => {
    try {
      const formData = new FormData()
      formData.append("coverImage",file)

      const res = await fetch(`/api/user/update-cover-image`,{
        method : "PUT",
        body : formData
      })
      if(res.ok){
        const data = await res.json()
        toast.success("CoverImage updated successfully!")
        dispatch(setUser({coverImage : data.data}))
      } else{
        toast.error("Failed to update avatar")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleEditAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file); // Append the actual File object
      
      const res = await fetch(`/api/user/update-avatar`, {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Avatar updated successfully!");
        // Dispatch the correct field update
        dispatch(setUser({ avatar: data.data }));
      } else {
        toast.error("Failed to update avatar.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating avatar.");
    }
  };
  
  // This function triggers the hidden file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const triggerCoverImageFileInput = () => {
    coverImageFileInputRef.current?.click()
  }

  const placeholderAvatar = 'https://via.placeholder.com/180';
  const placeholderCover = 'https://via.placeholder.com/1200x300';

  return (
    <div className='flex gap-5 flex-col'>
      {/* CoverImage */}
      <div className='w-[85vw] h-[18vw] relative flex justify-end items-end group transition-all duration-300'>
        <div
            className='absolute bg-black/50 text-white flex justify-center items-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer bottom-5 right-5  z-10'
            onClick={triggerCoverImageFileInput}
          >
            <button className='flex justify-center items-center gap-2 bg-blue-600 px-4 py-2 rounded-3xl'><span className='text-xl'>Edit</span><Edit /></button>
          </div>

          <input
            type='file'
            ref={coverImageFileInputRef}
            onChange={handleCoverImageFileChange}
            accept='image/*'
            className='hidden'
          />
        <Image
          alt='Cover Image'
          className='object-cover rounded-2xl group-hover:opacity-80 transition-all duration-300'
          src={user.coverImage || placeholderCover} // Provide a fallback
          fill
        />
      </div>

      <div className='w-full flex'>
        {/* User profile Icon */}
        <div className='relative flex justify-center items-center group transition-all duration-300 w-[180px] h-[180px] rounded-full'>
          
          <div
            className='absolute inset-0 bg-black/50 text-white flex justify-center items-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-10'
            onClick={triggerFileInput}
          >
            <Edit />
          </div>

          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='image/*'
            className='hidden'
          />
          
          <Image
            alt='User Profile Image'
            className='object-cover rounded-full group-hover:opacity-60 transition-all duration-300'
            fill
            src={user.avatar || placeholderAvatar} // Provide a fallback
          />
        </div>
        
        <div className='px-6 py-2 flex flex-col gap-1'>
          {/* Additional user information */}
          <span className='text-4xl font-semibold'>{user.fullName}</span>
          <span className=''>@{user.username} • {subscribersCount}</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;