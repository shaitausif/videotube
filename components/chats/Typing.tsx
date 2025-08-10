import { classNames } from "@/utils";

const Typing = () => {
  return (
    <div
      className={classNames(
        "p-3 md:p-4 rounded-3xl bg-secondary w-fit inline-flex gap-1.5"
      )}
    >
      <span className="animation1 mx-[0.5px] h-1 w-1 md:h-1.5 md:w-1.5 bg-zinc-300 rounded-full"></span>
      <span className="animation2 mx-[0.5px] h-1 w-1 md:h-1.5 md:w-1.5 bg-zinc-300 rounded-full"></span>
      <span className="animation3  mx-[0.5px] h-1 w-1 md:h-1.5 md:w-1.5 bg-zinc-300 rounded-full"></span>
    </div>
  );
};

export default Typing;
