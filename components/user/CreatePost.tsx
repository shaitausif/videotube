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
import { postSchema } from "@/schemas/PostSchema";
import { Input } from "@/components/ui/input";
import z from "zod";
import { toast } from "sonner";
import { Check, Upload } from "lucide-react";
import { requestHandler } from "@/utils";
import { uploadPost } from "@/lib/apiClient";

const CreatePost = () => {
  const [isPosting, setisPosting] = useState(false);
  const [isImageSelected, setisImageSelected] = useState(false);

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      caption: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof postSchema>) => {
    requestHandler(
      // @ts-ignore
      async() => await uploadPost(data),
      setisPosting,
      (res) => {
        console.log(res)
        toast.success(res.message)
      },
      (err) => {
        console.log(err)
        // @ts-ignore
        toast.error(err.message)
      }
    )
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
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea className="px-3 py-2 min-h-46 rounded-lg outline outline-gray-700 border-2 border-gray-800 focus:border-2 focus:border-gray-600 text-sm transition-discrete duration-300 focus:outline-gray-500" placeholder="Enter Caption" {...field} />
                      </FormControl>
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postImg"
                  render={({ field }) => (
                    <FormItem>
                      <label className="h-[100px] w-full" htmlFor="image">
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (!file) return;

                            if (!file.type.startsWith("image/")) {
                              toast.error("Please upload a valid image file.");
                              return;
                            }

                            field.onChange(file);
                            setisImageSelected(true);
                          }}
                          className="bg-gray-700/20 transition-all duration-300 hover:bg-gray-800/20 rounded-lg w-full h-full flex flex-col justify-center items-center group"
                        >
                          {isImageSelected ? (
                            <>
                              <Check className="group-hover:text-purple-200 transition-all duration-300" />
                              <span className="group-hover:text-purple-200 transition-all duration-300">
                                Image is ready to upload
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="group-hover:text-purple-200 transition-all duration-300" />
                              <span className="group-hover:text-purple-200 transition-all duration-300">
                                Upload Image
                              </span>
                            </>
                          )}
                        </div>
                      </label>
                      <FormControl>
                        <Input
                        accept="image/*"
                          className="hidden"
                          id="image"
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (!file.type.startsWith("image/")) {
                              e.target.value = "";
                              toast.error("Please upload a valid image file.");
                              return;
                            }

                            field.onChange(file);
                            setisImageSelected(true)
                          }}
                        />
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

export default CreatePost;
