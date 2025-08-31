"use client";
import { userPosts } from "@/lib/apiClient";
import { PostInterface } from "@/models/post.models";
import { requestHandler } from "@/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AllVideosSkel from "../skeletons/AllVideosSkel";
import PostSkel from "../skeletons/PostSkel";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const UserPosts = ({ userId }: { userId: string }) => {
  const [isFetchingPosts, setisFetchingPosts] = useState(false);
  const [posts, setposts] = useState<PostInterface[] | any[]>([]);
  const skeleton = [1, 2, 3, 4];

  const fetchPosts = async () => {
    requestHandler(
      async () => await userPosts(userId),
      setisFetchingPosts,
      (res) => {
        console.log(res);
        setposts(res.data);
        toast.success(res.message);
      },
      (err) => {
        console.log(err);
        // @ts-ignore
        toast.error(err.message);
      }
    );
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col w-full items-center">
      {isFetchingPosts ? (
        <div className="w-full gap-4 flex flex-col justify-center">
          {skeleton.map((skel) => (
            
              <div className="justify-center flex" key={skel}>
                <PostSkel height="h-[60vh]" width="w-[50vw]" />
              </div>
            
          ))}
        </div>
      ) : posts && posts.length != 0 ? (
        <div className="w-full gap-5 flex flex-col items-center">
          {posts.map((post) => (
            <div
              key={post._id}
              className={`flex flex-col md:w-[50vw] h-[60vh] space-y-3 col-span-1 `}
            >
              <div className="space-y-2">
                <div className="flex gap-3 items-center">
                  <div className="relative w-[45px] h-[45px]">
                    <Image
                      fill
                      className="rounded-full object-cover absolute"
                      alt="User Profile Image"
                      src={post.owner.avatar}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col ">
                    <span>{post.owner.fullName}</span>
                    <span className="text-gray-500 text-sm">
                      @{post.owner.username}
                    </span>
                  </div>
                  <span></span>
                  </div>
                </div>
                <p>{post.caption}</p>
              </div>
              <div className="relative w-full h-full">
                <Image
                  src={post.postImg}
                  alt="Post Image"
                  className="absolute object-cover rounded-lg"
                  fill
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 ">No posts yet.</div>
      )}
    </div>
  );
};

export default UserPosts;
