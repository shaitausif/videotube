'use client'
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cross, Plus } from "lucide-react";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import UploadVideo from "./UploadVideo";
import CreatePost from "./CreatePost";
import CreateTweet from "./CreateTweet";

interface UploadContentModalProps {
  onClose: () => void;
  children?: React.ReactNode;
}

const UploadContentModal: React.FC<UploadContentModalProps> = ({ onClose }) => {

  const [active, setactive] = useState<"Video" | "Post" | "Tweet" | null>(null)
  

  
  


  return (
    <motion.div
    animate={{
      opacity : 1,

    }}
    transition={{
      duration : 0.5,
      ease : 'easeInOut'
    }}
    initial={{
      opacity : 0,
    }}
    exit={{ opacity: 0 }}
    onClick={() => onClose()}
    className="fixed inset-0 z-20 flex bg-opacity-70 backdrop-blur-lg items-center justify-center transition-all duration-300 bg-black/50">
      {/* Modal Box */}
      <motion.div
      initial={{
        y : 500
      }}
      animate={{
        y : 0
      }}
      exit={{
        y : 500,
        opacity : 0
      }}


      onClick={(e) => e.stopPropagation()}
      className="w-[40vw] h-fit bg-gray-700/30 rounded-lg relative backdrop-blur-lg">
          <Plus onClick={() => onClose()} className="absolute top-3 right-3 rotate-45 hover:text-red-400 transition-all duration-300"  />
            {
              active && (
                <ArrowLeft size={'20'}
                onClick={() => setactive(null)}
              className="absolute top-3 left-3 hover:text-purple-400 transition-all duration-300"
            />
              )
            }
            <AnimatePresence mode="wait">
            {
              !active && (
                <motion.div
                exit={{
                  x : -200
                }}
                // transition={{
                //   duration : 2
                // }}
                className="py-30 gap-5 flex flex-col items-center">
                <Button onClick={() => setactive("Video")} className="opacity-100 hover:bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 border-purple-300 hover:font-semibold cursor-pointer w-[200px] hover:border-purple-500 transition-all duration-300 border rounded-full px-12 py-2">Upload Video</Button>
                <Button onClick={() => setactive("Post")} className="opacity-100 hover:bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 border-purple-300 hover:font-semibold cursor-pointer w-[200px] hover:border-purple-500 transition-all duration-300 border rounded-full px-12 py-2">Create Post</Button>
                <Button onClick={() => setactive("Tweet")} className="opacity-100 hover:bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 border-purple-300 hover:font-semibold cursor-pointer w-[200px] hover:border-purple-500 transition-all duration-300 border rounded-full px-12 py-2">Create Tweet</Button>
                
            </motion.div>
              )
            }
       
              {
                active === 'Video' && (
                  <UploadVideo onClose={onClose} />
                )
              }
              {
                active === "Post" && (
                  <CreatePost onClose={onClose} />
                )
              }
              {
                active === 'Tweet' && (
                  <CreateTweet onClose={onClose} />
                )
              }
            
          </AnimatePresence>
            
      </motion.div>
    </motion.div>
  );
};

export default UploadContentModal;
