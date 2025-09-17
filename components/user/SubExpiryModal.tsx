import React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { useRouter } from "next/navigation";

const Step = ({ title }: { title: string }) => {
  return (
    <li className="flex gap-2 items-start">
      <CheckIcon />
      <p className="text-white">{title}</p>
    </li>
  );
};


const SubExpiryModal = ({ onClose }: { onClose: () => void }) => {
    const router = useRouter()


  return (
    <motion.div
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
      initial={{
        opacity: 0,
      }}
      exit={{ opacity: 0 }}
      onClick={() => onClose()}
      className="fixed inset-0 z-50 flex bg-opacity-70 backdrop-blur-lg items-center justify-center transition-all duration-300 bg-black/50"
    >
      {/* Modal Box */}
      <motion.div
        initial={{
          y: 500,
        }}
        animate={{
          y: 0,
        }}
        exit={{
          y: 500,
          opacity: 0,
        }}
        onClick={(e) => e.stopPropagation()}
        className=" w-fit mx-4 h-fit bg-gray-700/30 rounded-lg relative backdrop-blur-lg"
      >

          <CardSpotlight className="mx-4 md:mx-0 md:h-108 md:w-100">
            <p className="text-lg font-bold relative z-20 mt-2 text-white">
                          Your Premium Plan has been expired
                        </p>
                       
        
                        <div className="text-neutral-200 mt-4 relative z-20">
                          <p className="mb-2 text-md md:text-lg">
                            ₹129/month
                          </p>
                          What you'll get with VideoTube Premium:
                          <ul className="list-none  mt-2 text-sm md:text-base">
                            <Step title="No tweet limits" />
                            <Step title="AI Message Enhancer" />
                            <Step title="Watch videos without ads" />
                            <Step title="Free email alerts" />
                            <Step title="Free push notifications" />
                            <Step title="Real Time chats with Users" />
                          </ul>
                        </div>
                        <Button
                          onClick={() => {
                            router.push('/upgrade')
                          }}
                          className="mt-4 text-center w-full relative z-20 text-sm"
                        >
                          Get started with Premium
                        </Button>
                        <Button
                          onClick={() => onClose()}
                          className="mt-4 text-center w-full relative z-20 text-sm"
                        >
                          Continue for Free
                        </Button>
                      </CardSpotlight>


      </motion.div>
    </motion.div>
  );
};

export default SubExpiryModal;
