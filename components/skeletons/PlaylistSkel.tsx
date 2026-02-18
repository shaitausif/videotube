import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const PlaylistSkel = () => {
  return (
    <div className="flex flex-col space-y-3 col-span-1">
      <Skeleton className="h-[180px] w-full rounded-xl" />
      <div className="space-y-2 px-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
};

export default PlaylistSkel;
