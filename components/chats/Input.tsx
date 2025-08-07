import React from "react";
import { classNames } from "@/utils";

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => {
  return (
    <input
      {...props}
      className={classNames(
        "block w-full md:px-4 md:py-3 px-3 py-1 rounded-md md:rounded-xl outline-[1px] outline-zinc-400 border-0 bg-secondary text-white font-light placeholder:text-white/70",
        props.className || ""
      )}
    />
  );
};

export default Input;
