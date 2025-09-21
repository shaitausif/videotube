"use client";
import { formatDistanceToNow } from "date-fns";
import { EllipsisVertical, ThumbsDown, ThumbsUp } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  deleteComment,
  getVideoComments,
  postComment,
  toggleCommentDisLike,
  toggleCommentLike,
} from "@/lib/apiClient";
import { requestHandler } from "@/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loader from "./skeletons/Loader";
import { useForm } from "react-hook-form";
import z from "zod";
import { PostCommentSchema } from "@/schemas/PostCommentSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const AllComments = ({ videoId }: { videoId: string }) => {
  const [videoComments, setvideoComments] = useState<any[]>([]);
  const [loadingComments, setloadingComments] = useState({});
  const [commentsCount, setcommentsCount] = useState(0);
  const [isPostingComment, setisPostingComment] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    const getvideoComments = async () => {
      requestHandler(
        async () => await getVideoComments(videoId),
        setloadingComments,
        (res) => {
          setcommentsCount(res.data.total);
          setvideoComments(res.data.comments);
        },
        (err) => toast.error(err)
      );
    };
    getvideoComments();
  }, []);

  const handleDeleteComment = async (commentId: string) => {
    requestHandler(
      async () => await deleteComment(commentId),
      null,
      (res) => {
        toast.success("Comment Deleted Successfully");
        setvideoComments((prev) => prev.filter((p) => p._id !== commentId));
        setcommentsCount((prev) => prev - 1);
      },
      (err) => {
        toast.error(err);
      }
    );
  };

  // Keeping timers for each comment
  const commentTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});  

  const handleToggleCommentLike = (commentId: string) => {
    // Optimistic UI update
    setvideoComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              likesCount: comment.isLiked
                ? comment.likesCount - 1
                : comment.likesCount + 1,
              isLiked: !comment.isLiked,
            }
          : comment
      )
    );

    // Clearing previous timer for this comment
    if (commentTimers.current[commentId]) {
      clearTimeout(commentTimers.current[commentId]);
    }

    // Setting a new timer
    commentTimers.current[commentId] = setTimeout(() => {
      requestHandler(
        async () => await toggleCommentLike(commentId),
        null,
        (res) => {
          console.log("Server updated:", res);
        },
        (err) => toast.error(err)
      );
      delete commentTimers.current[commentId]; // cleanup
    }, 1000);
  };


  const commentDislikeTimer = useRef<{ [key: string]: NodeJS.Timeout }>({})

  const handleToggleCommentDislike = async(commentId : string) => {
    setvideoComments((prev) => 
      prev.map((comment) => 
        comment._id === commentId 
     ? {
      ...comment,
      disLikesCount : comment.isDisLiked ? comment.disLikesCount - 1 : comment.disLikesCount + 1,
      isDisLiked : !comment.isDisLiked

     } : comment
      )
    )

    if(commentDislikeTimer.current[commentId]){
      clearTimeout(commentDislikeTimer.current[commentId])
    }

    commentDislikeTimer.current[commentId] = setTimeout(() => {
      requestHandler(
        async() => await toggleCommentDisLike(commentId),
        null,
        (res) => {
          toast.success(res.message)
        },
        (err) => {
          // @ts-ignore
          toast.error(err.message)
        }
      )
      delete commentDislikeTimer.current[commentId]
    }, 1000);

  }



  const form = useForm<z.infer<typeof PostCommentSchema>>({
    resolver: zodResolver(PostCommentSchema),
    defaultValues: {
      comment: "",
    },
  });

  // Function for handling comments Post
  const handleCommentPost = async (data: z.infer<typeof PostCommentSchema>) => {
    requestHandler(
      async () => await postComment(videoId, data.comment),
      setisPostingComment,
      (res) => {
        setvideoComments((prev) => [res.data, ...prev]);
        setcommentsCount((prev) => prev + 1);
        form.reset();
        toast.success("Comment Posted Successfully");
      },
      (err) => toast.error(err)
    );
  };

  return (
    <>
      {/* Post Comment */}
      <div className="md:text-md font-semibold">{commentsCount} Comments</div>
      {user && user._id ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCommentPost)}
            className="flex md:gap-4 gap-4 w-full"
          >
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      className="placeholder:text-[#A1A1A1] w-full"
                      placeholder="Enter a comment"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Comment</Button>
          </form>
        </Form>
      ) : (
        <div
          onClick={() => router.push(`/sign-in`)}
          className="flex justify-center"
        >
          <Button className="rounded-full">
            Sign In to comment on the Video
          </Button>
        </div>
      )}
      <div className="w-full md:m-5 my-2 py-3 md:py-6">
        {loadingComments ? (
          <Loader />
        ) : commentsCount > 0 && videoComments.length ? (
          <div className="flex flex-col gap-4 md:gap-6 ">
            {videoComments.map((comment) => (
              <div key={comment?._id as string} className="flex items-start gap-3 md:gap-5 relative">
                {/* Avatar Icon */}
                <div
                  // @ts-ignore
                  onClick={() => router.push(`/c/${comment.owner.username}`)}
                  className="relative w-7 h-7 md:w-10 md:h-10 shrink-0"
                >
                  <Image
                    className="object-cover rounded-full"
                    alt="Avatar Icon"
                    fill
                    src={
                      // @ts-ignore
                      (comment?.owner.avatar as string) || "/AltProfile.png"
                    }
                  />
                </div>
                <div className="flex flex-col cursor-pointer">
                  {/* Username and time */}

                  <span
                    // @ts-ignore
                    onClick={() => router.push(`/c/${comment.owner.username}`)}
                  >
                    <span className="text-sm">
                      @
                      {
                        // @ts-ignore
                        comment.owner.username
                      }
                    </span>{" "}
                    <span className="dark:text-gray-300 dark:hover:text-gray-400 transition-all duration-300 text-[14px]">
                      {formatDistanceToNow(new Date(comment.createdAt!), {
                        addSuffix: true,
                      })}
                    </span>
                  </span>
                  {/* Comment by the User */}
                  <span className="w-fit text-sm">{comment.content}</span>
                  {/* Like and Dislike the Comment */}
                  {user._id ? (
                    <span className="flex items-center gap-5 mt-3">
                      <span className="flex items-center">
                        <span
                        onClick={() => {
                              handleToggleCommentLike(comment._id as string)
                              if(comment.isDisLiked){
                                handleToggleCommentDislike(comment._id)
                              }
                            }
                              
                            }
                          className={` dark:hover:bg-gray-800 rounded-full transition-all duration-300 p-2`}
                        >
                          <ThumbsUp
                            fill={`${comment.isLiked ? "white" : ""}`}
                            
                            className="w-4 h-4"
                          />
                        </span>{" "}
                        {
                          // @ts-ignore
                          comment.likesCount
                        }
                      </span>

                      <span className="flex items-center">
                        {" "}
                        {
                          // @ts-ignore
                          comment.disLikesCount
                        }
                        <span 
                        onClick={() => {
                            handleToggleCommentDislike(comment._id)
                            if(comment.isLiked){
                              handleToggleCommentLike(comment._id)
                            }
                          }}
                        className=" dark:hover:bg-gray-800 rounded-full transition-all duration-300 p-2">
                          
                          <ThumbsDown
                          
                            fill={`${comment.isDisLiked ? "white" : ""}`}
                            className="w-4 h-4"
                          />
                        </span>
                      </span>
                    </span>
                  ) : (
                    <div
                      onClick={() => router.push("/sign-in")}
                      className="flex py-1 w-fit justify-center items-center"
                    >
                      <Button className="px-2 py-1 h-6  text-sm">
                        Sign-in
                      </Button>
                    </div>
                  )}
                </div>
                <span className="absolute right-5 top-0">
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
                        comment.owner._id !== user._id ? (
                          // @ts-ignore
                          <DropdownMenuItem
                            className="transition-all duration-300"
                            onClick={() =>
                              router.push(`/c/${comment.owner.username}`)
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
                                    Comment?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteComment(comment._id as string)
                                    }
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
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-[10vh]">
            No Comments yet.
          </div>
        )}
      </div>
    </>
  );
};

export default AllComments;
