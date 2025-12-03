"use client";
import React, { useState } from "react";
import Loader from "../skeletons/Loader";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { requestHandler } from "@/utils";
import { TweetSchema } from "@/schemas/TweetSchema";
import { createTweet } from "@/lib/apiClient";
import { toast } from "sonner";
import TweetMentioned from "./TweetMentioned";
import { useSelector } from "react-redux";
import { RootState } from "@react-three/fiber";

const CreateTweet = ({onClose} : { onClose: () => void}) => {
  const [isPosting, setisPosting] = useState(false);
  // @ts-ignore
  const user = useSelector((state: RootState) => state.user)

  const form = useForm({
    resolver: zodResolver(TweetSchema),
    defaultValues: {
      tweet: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof TweetSchema>) => {
    requestHandler(
      async () => await createTweet(data.tweet),
      setisPosting,
      (res) => {
        form.reset()
        onClose()
        console.log(res);
      },
      (err) => {
        // @ts-ignore
        toast.error(err.message);
      }
    );
  };

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
    <>
      {isPosting ? (
        <div className="flex justify-center items-center w-full h-[50vh]">
          <Loader size="size-12" />
        </div>
      ) : (
        <motion.div
          initial={{
            x: 50,
            opacity: 0,
          }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          exit={{
            x: -100,
            opacity: 0,
          }}
          // transition={{
          //   duration : 2
          // }}

          className="py-14 gap-5 flex flex-col items-center w-full h-full"
        >
          <div className="w-full h-full px-6">
            <Form {...form}>
              <form
                className="flex flex-col gap-5 w-full h-full"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <h3 className="text-center text-lg text-gray-800 dark:text-gray-200 font-semibold">Create Tweet</h3>
                <FormField
                  control={form.control}
                  name="tweet"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative w-full h-full">
                          <div className="absolute top-0 left-0  w-full h-full py-3 px-3  whitespace-pre-wrap break-words rounded-lg text-sm text-gray-700 dark:text-gray-200">
                            {highlightMentions(field.value)}
                            <div className="absolute bottom-3 right-3 text-sm text-end text-gray-700 dark:text-gray-500">{field.value.length}/{user.subscription?.active ? 1000 : 200}</div>
                          </div>
                          <textarea
                          maxLength={user.subscription?.active ? 1000 : 200}
                            className="px-3 w-full bg-transparent text-transparent caret-white relative py-2 min-h-46 rounded-lg outline outline-gray-700 border-2 border-gray-800 focus:border-2 focus:border-gray-600 text-sm transition-discrete duration-300 focus:outline-gray-500"
                            placeholder="Enter Tweet"
                            {...field}
                          />
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default CreateTweet;
