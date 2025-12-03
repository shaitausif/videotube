'use client'
import React from "react";
import { motion } from "motion/react";

const Loading = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <motion.div
        className="relative flex justify-center items-center"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
        }}
      >
        {/* Outer ring */}
        <motion.div
          className="h-24 w-24 border-[6px] border-t-blue-500 border-r-transparent border-b-green-500 border-l-transparent rounded-full dark:border-t-blue-400 dark:border-b-green-400"
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        />

        {/* Inner pulse */}
        <motion.div
          className="absolute h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 blur-sm dark:from-green-500 dark:to-blue-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "easeInOut",
          }}
        />

        {/* Glow ring */}
        <motion.div
          className="absolute h-20 w-20 rounded-full border-[2px] border-blue-400 opacity-40 blur-md dark:border-blue-300"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
};

export default Loading;
