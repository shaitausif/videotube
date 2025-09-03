"use client";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import React from "react";
import { useSelector } from "react-redux";

const TweetMentioned = ({ children }: { children: string }) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  return (
    <span
      onClick={() => {
        if (user.username !== children.split("@")[1]) {
          router.push(`/c/${children.split("@")[1]}`);
        }
      }}
      className="text-blue-500 z-50 hover:text-blue-600 transition-all duration-300 cursor-pointer "
    >
      {children}
    </span>
  );
};

export default TweetMentioned;
