import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const PostSkel = ({height, width}: {height?: string, width?: string}) => {
  return (
    <>
    
      <div  className={`flex flex-col  ${width ? width : 'w-full'} ${height ? height : 'h-[40vh]'}  space-y-3 col-span-1`}>
        <div className="space-y-2">
            <div className="flex gap-3 items-center">
                <Skeleton className={`w-[45px] rounded-full h-[45px]`} />
                <div className="flex flex-col gap-2">
                    <Skeleton className={`w-[100px] rounded-full h-[10px]`} />
                    <Skeleton className={`w-[125px] rounded-full h-[10px]`} />
                </div>
            </div>
        <Skeleton className={`h-4 w-full ${width ? width : 'md:w-[250px]'}`} />
        <Skeleton className={`h-4 w-full  ${width ? width : 'md:w-[200px]'}`} />
      </div>
      <Skeleton className={`h-[220px] ${width ? width : 'w-full'} w-full rounded-xl`} />
      
    </div>
    
    </>
  );
};

export default PostSkel;
