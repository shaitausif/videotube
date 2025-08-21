import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const WatchHistorySkel = () => {
  return (
    <div className="flex  md:gap-8 gap-4  space-y-3 col-span-1">
      <Skeleton className="w-[40vw] md:w-[15vw] h-[20vw]  md:h-[10vw] rounded-xl" />
      <div className="py-2 md:py-4 space-y-2">
        <Skeleton className="h-4 w-[30vw]" />
        <Skeleton className="h-4 w-[40vw]" />
      </div>
    </div>
  );
};

export default WatchHistorySkel;
