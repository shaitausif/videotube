'use client'
import { userTweets } from '@/lib/apiClient'
import { Tweet, TweetInterface } from '@/models/tweet.model'
import { requestHandler } from '@/utils'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import PostSkel from '../skeletons/PostSkel'
import Image from 'next/image'
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
import { EllipsisVertical, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import TweetMentioned from './TweetMentioned'

const UserTweets = ({userId} : { userId : string }) => {


  const [isFetching, setisFetching] = useState(false)
  const [Tweets, setTweets] = useState<TweetInterface[] | any[]>([])
  const skeleton = [1,2]
  const router = useRouter()

  const user = useSelector((state: RootState) => state.user)

    
    useEffect(() => {
        const fetchUserTweets = async() => {
            requestHandler(
              async() => await userTweets(userId),
              setisFetching,
              (res) => {
                setTweets(res.data)
                toast.success("Tweets fetched successfully.")
              },
              (err) => {
                // @ts-ignore
                toast.error(err.message)
              }
            )
        }

        fetchUserTweets()
    },[])

     const highlightMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) =>
      parts.length > 1 && part.startsWith("@") ? (
        <TweetMentioned key={i}>{part}</TweetMentioned>
      ) : (
        <span key={i} className="pointer-events-none">
          {part}
        </span>
      )
    );
  };


    return (
    <div className="flex flex-col w-full items-center">
      {isFetching ? (
        <div className="w-full gap-4 flex flex-col justify-center">
          {skeleton.map((skel) => (
            <div className="justify-center flex" key={skel}>
              <PostSkel height="h-[60vh]" width="w-[50vw]" />
            </div>
          ))}
        </div>
      ) : Tweets && Tweets.length != 0 ? (
        <div className="w-full gap-5 flex flex-col items-center">
          {Tweets.map((tweet) => (
            <div
              key={tweet._id}
              className={`flex flex-col md:w-[50vw] h-fit space-y-3 my-5  col-span-1 `}
            >
              <div className="space-y-2">
                <div className="flex gap-3 items-center">
                  <div className="relative w-[45px] h-[45px]">
                    <Image
                      fill
                      className="rounded-full object-cover absolute"
                      alt="User Profile Image"
                      src={tweet.owner.avatar}
                    />
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col ">
                      <span>{tweet.owner.fullName}</span>
                      <span className="text-gray-500 text-sm">
                        @{tweet.owner.username}
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
                            tweet.owner._id !== user._id ? (
                              // @ts-ignore
                              <DropdownMenuItem
                                className="transition-all duration-300"
                                onClick={() =>
                                  router.push(`/c/${tweet.owner.username}`)
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
                                        Tweet?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          // handleDeletePost(post._id);
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
                <p>{
                    highlightMentions(tweet.content)
                  }</p>
              </div>
             
              
              <div className="flex justify-end gap-6 px-4 items-center">
                <span>{tweet.likesCount}</span>
                <ThumbsUp
                  fill={`${tweet.isLiked ? "white" : ""}`}
                  onClick={() => {
                    // dotogglePostLike(post._id);
                  }}
                />
                <ThumbsDown />
              </div>
              <hr />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 ">No posts yet.</div>
      )}
    </div>
  );
};


export default UserTweets
