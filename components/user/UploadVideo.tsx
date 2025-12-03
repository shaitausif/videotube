'use client'
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UploadVideoSchema } from "@/schemas/UploadVideoSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Upload } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { requestHandler } from "@/utils";
import { uploadVideo } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import Loader from "../skeletons/Loader";


const UploadVideo = ({onClose}: {onClose: () => void}) => {


  const [isVideoSelected, setisVideoselected] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showProgress, setshowProgress] = useState(false)
  const [isPublishing, setisPublishing] = useState(false)
  const router = useRouter()
  const form = useForm<z.infer<typeof UploadVideoSchema>>({
    resolver: zodResolver(UploadVideoSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof UploadVideoSchema>) => {
    requestHandler(
      // @ts-ignore
      async ()=> await uploadVideo(data),
      setisPublishing,
      (res) => {
        
        toast.success(res.message)
        setisPublishing(false)
        form.reset()
        onClose()
      },
      (err) => {
        
        console.log(err)
        // @ts-ignore
        toast.error(err.message)
      }
    ) 
  };



  // fake smooth progress animation
  const startProgressAnimation = () => {
    setUploadProgress(0);
    setshowProgress(true)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setshowProgress(false)
        }, 1000);
      }
    }, 100); // 50ms steps → ~1s animation
    
  };

  return (
    <>
      {
        isPublishing ? (
          <div className="flex justify-center items-center w-full h-[50vh]">
              <Loader size="size-12" />
          </div>
        ) : (
           <motion.div
    initial={{
      x : 50,
      opacity : 0
    }}
    animate={{
      x: 0,
      opacity : 1
    }}
    exit={{
      x: -100,
      opacity : 0
    }}
    // transition={{
    //   duration : 2
    // }}
    
    className="py-14 gap-5 flex flex-col items-center w-full h-full">
      <div className="w-full h-full px-6">
        <Form {...form}>
          <form className="flex flex-col gap-5 w-full h-full" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
    
                  <FormControl>
                    <Input placeholder="Enter Video Title" {...field} />
                  </FormControl>
           
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
           
                  <FormControl>
                    <Input placeholder="Enter Video Description" {...field} />
                  </FormControl>
                 
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="videoFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video File</FormLabel>
                  <label
                  className="h-[100px] w-full"
                  htmlFor="video">
                    <div
                    onDragOver={(e) => e.preventDefault() }
                    onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (!file) return;

          if (!file.type.startsWith("video/")) {
          
            toast.error("Please upload a valid video file.");
            return;
          }
          startProgressAnimation()

          field.onChange(file);
          setisVideoselected(true);
        }}
                    className="bg-gray-700/20 transition-all duration-300 hover:bg-gray-800/20 rounded-lg w-full h-full flex flex-col justify-center items-center group"> 
                      {
                        isVideoSelected ? (
                          <>
                          <Check className="group-hover:text-purple-400 dark:group-hover:text-purple-200 transition-all duration-300" />
                      <span className="group-hover:text-purple-400 dark:group-hover:text-purple-200 transition-all duration-300">Video is ready to upload</span>
                          </>
                        ) : (
                          <>
                          <Upload className="group-hover:text-purple-400 dark:group-hover:text-purple-200 transition-all duration-300" />
                      <span className="group-hover:text-purple-400 dark:group-hover:text-purple-200 transition-all duration-300">Upload Video</span>
                          </>
                        )
                      }
                      
                    </div>
                  </label>  
                  <FormControl>
                    <Input
                    accept="video/*"
                    className="hidden" id="video" type="file" placeholder="shadcn" 
                    onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith("video/")) {
              e.target.value = ''
              toast.error("Please upload a valid video file.");
              return;
            }
            startProgressAnimation()
            field.onChange(file);
            setisVideoselected(true);
          }}
                    />
                  </FormControl>
                  <FormDescription>
                     
                      
                      {
                        showProgress && (
                          <>
                          <Progress value={uploadProgress} className="w-full h-1.5" />
                          <span className="text-right w-full mt-2">{uploadProgress}%</span>
                          </>
                        )
                      }
            
                     
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail</FormLabel>
                  <FormControl>
                    <Input
                    accept="image/*"
                    type="file" className="" placeholder="shadcn"
                    onChange={(e) => {
                      // @ts-ignore
                      const file = e?.target?.files[0]
                      if(!file.type.startsWith("image")){
                        //@ts-ignore
                        e.target.value = '';
                        toast.error("Please Upload a valid image file")
                        return;
                      }
                      field.onChange(e.target.files ? e.target.files[0] : null)
                    }
                      
                    }
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
        )
      }
    </>
  );
};

export default UploadVideo;
