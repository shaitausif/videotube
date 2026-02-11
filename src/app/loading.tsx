'use client'
import React from "react";
import { motion } from "motion/react";

const Loading = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-background transition-colors duration-500 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/[0.07] dark:bg-purple-500/[0.04] blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-2/3 w-[400px] h-[400px] rounded-full bg-blue-500/[0.05] dark:bg-blue-500/[0.03] blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />
      </div>

      {/* Loader */}
      <div className="relative flex justify-center items-center w-16 h-16">
        {/* Track ring */}
        <div className="absolute inset-0 rounded-full border-[2.5px] border-foreground/[0.06] dark:border-foreground/[0.08]" />

        {/* Spinning gradient arc */}
        <motion.svg
          className="absolute inset-0 w-16 h-16"
          viewBox="0 0 64 64"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <defs>
            <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(168 85 247)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle
            cx="32"
            cy="32"
            r="29.5"
            fill="none"
            stroke="url(#loader-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="140 46"
          />
        </motion.svg>

        {/* Center dot pulse */}
        <motion.div
          className="w-2 h-2 rounded-full bg-purple-500"
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        />
      </div>

      {/* Brand text */}
      <motion.p
        className="mt-8 text-sm font-medium tracking-widest uppercase text-foreground/40"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        VideoTube
      </motion.p>

      {/* Shimmer dots */}
      <div className="flex gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1 h-1 rounded-full bg-foreground/30"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;
