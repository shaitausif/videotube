import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const AllVideosSkel = () => {
  return (
    <div  className="flex flex-col h-[45vh] space-y-3 col-span-1">
      <Skeleton className="h-[220px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full md:w-[250px]" />
        <Skeleton className="h-4 w-full  md:w-[200px]" />
      </div>
    </div>
  );
};

export default AllVideosSkel;
