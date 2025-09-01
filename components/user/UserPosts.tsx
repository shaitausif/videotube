"use client";
import { deletePost, togglePostLike, userPosts } from "@/lib/apiClient";
import { PostInterface } from "@/models/post.models";
import { requestHandler } from "@/utils";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import AllVideosSkel from "../skeletons/AllVideosSkel";
import PostSkel from "../skeletons/PostSkel";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { EllipsisVertical, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

const UserPosts = ({ userId }: { userId: string }) => {
  const [isFetchingPosts, setisFetchingPosts] = useState(false);
  const [posts, setposts] = useState<PostInterface[] | any[]>([]);
  const [isLiked, setisLiked] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const skeleton = [1, 2];

  const fetchPosts = async () => {
    requestHandler(
      async () => await userPosts(userId),
      setisFetchingPosts,
      (res) => {
        console.log(res.data);

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

  const handleDeletePost = async (postId: string) => {
    requestHandler(
      async () => await deletePost(postId.toString()),
      null,
      (res) => {
        setposts((prev) => prev.filter((p) => p._id !== postId));
        toast.success(res.message);
      },
      (err) => {
        // @ts-ignore
        toast.error(err.message);
      }
    );
  };

  const dotogglePostLike = (postId: string) => {
    requestHandler(
      // @ts-ignore
      async () => await togglePostLike(postId.toString()),
      null,
      (res) => {
        setposts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, isLiked: res.data ? true : false ,
                likesCount : res.data ? post.likesCount + 1 : post.likesCount -1
              }
              : post
          )
        );
        toast.success(res.message)
      },
      (err) => {
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
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col ">
                      <span>{post.owner.fullName}</span>
                      <span className="text-gray-500 text-sm">
                        @{post.owner.username}
                      </span>
                    </div>

                    <span className="">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <EllipsisVertical className="w-6 h-6 p-1 rounded-full dark:hover:bg-gray-600 transition-all duration-300 " />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-25 dark:bg-[#161616]/50"
                          align="center"
                        >
                          {
                            // @ts-ignore
                            post.owner._id !== user._id ? (
                              // @ts-ignore
                              <DropdownMenuItem
                                className="transition-all duration-300"
                                onClick={() =>
                                  router.push(`/c/${post.owner.username}`)
                                }
                              >
                                Channel
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                asChild
                                className="transition-all duration-300"
                              >
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button className="w-full transition-all duration-300">
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Are you absolutely sure?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to Delete this
                                        Post?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          handleDeletePost(post._id);
                                        }}
                                      >
                                        Continue
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuItem>
                            )
                          }
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </span>
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
              
              <div className="flex justify-end gap-6 px-4 items-center">
                <span>{post.likesCount}</span>
                <ThumbsUp
                  fill={`${post.isLiked ? "white" : ""}`}
                  onClick={() => {
                    dotogglePostLike(post._id);
                  }}
                />
                <ThumbsDown />
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
