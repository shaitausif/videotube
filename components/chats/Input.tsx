import React from "react";
import { classNames } from "@/utils";

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => {
  return (
    <input
      {...props}
      className={classNames(
        "block w-full rounded-xl outline-[1px] outline-zinc-400 border-0 py-3 px-4 bg-secondary text-white font-light placeholder:text-white/70",
        props.className || ""
      )}
    />
  );
};

export default Input;
