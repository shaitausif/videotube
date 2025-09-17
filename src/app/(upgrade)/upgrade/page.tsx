"use client";
import { Button } from "@/components/ui/button";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { RootState } from "@react-three/fiber";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {motion} from 'motion/react'

const Step = ({ title }: { title: string }) => {
  return (
    <li className="flex gap-2 items-start">
      <CheckIcon />
      <p className="text-white">{title}</p>
    </li>
  );
};

const page = () => {
  const [isMonthlySubscription, setisMonthlySubscription] = useState(true);
  // @ts-ignore
  const user = useSelector((state: RootState) => state?.user);
  const router = useRouter();

  const pay = async (amount: number) => {
    try {
      if (!user && !user._id) {
        toast.error("Please login to upgrade");
        router.push(`/`);
      }

      const planPrices: any = {
        12900: "monthly",
        99900: "annual",
      };

      let res = await fetch(`/api/razorpay/initiatePremium`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from_user: user._id, plan: planPrices[amount] }),
      });

      if (!res.ok) return toast.error("Unable to create payment order");
      let { data } = await res.json();

      let options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "VideoTube",
        description: "Test Transaction",
        image: "/Logo.png",
        order_id: data.id,
        // the API endpoint where we will update
        callback_url: `${process.env.NEXT_PUBLIC_URL}/api/razorpay/verify`,
        prefill: {
          //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
          name: user.username, //your customer's name
          email: user.email,
          contact: "9000090000", //Provide the customer's phone number for better conversion rates
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3499cc",
        },
      };

      let rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>
      <div className="w-[98.5vw] h-full flex justify-center items-center dark:text-white pointer-events-auto">
        <div className="w-full md:mx-12  rounded-md h-[80vh] flex justify-center items-start">
          <div className="flex flex-col md:gap-6 gap-4 items-center py-8 md:py-16">
            {/* Plans and pricing */}
            <motion.p
            initial={{
              y : -50,
              opacity : 0,
            }}
            animate={{
              y : 0,
              opacity : 1
            }}
            transition={{
              duration : 0.5
            }}
            className="text-3xl md:text-4xl font-bold">Plans and Pricing</motion.p>
            <motion.div
            initial={{
              y : -30,
              opacity : 0,
            }}
            animate={{
              y : 0,
              opacity : 1
            }}
            transition={{
              duration : 0.5,
              delay : 0.5
            }}
            className="flex justify-center md:text-base text-sm flex-col items-center">
              <p>Resolve unlimited credits when you pay yearly, and </p>
              <p>save on your plan</p>
            </motion.div>

            {/* Monthly and Anually Switch */}

            <motion.div
            animate={{
              opacity : 1,
              y : 0
            }}
            initial={{
              y : -10,
              opacity : 0
            }}
            transition={{
              duration : 0.8,
              delay : 1
            }}
            className="flex justify-center items-center bg-gray-700/20 rounded-2xl cursor-pointer">
              <div
                onClick={() => setisMonthlySubscription(true)}
                className={`md:px-6 px-4 text-sm md:text-base  py-1.5 rounded-2xl ${isMonthlySubscription ? "bg-black" : ""}`}
              >
                Monthly
              </div>
              <div
                onClick={() => {
                  console.log("Hey");
                  setisMonthlySubscription(false);
                }}
                className={`md:px-6 px-4 text-sm md:text-base  py-1.5 rounded-2xl ${!isMonthlySubscription ? "bg-black" : ""}`}
              >
                Annual
              </div>
            </motion.div>

            {/* Price Cards */}
            <motion.div
            initial={{
              opacity : 0,
              scale : 0.95
            }}
            animate= {{ opacity : 1, scale : 1}}
            transition={{
              duration : 2, delay : 1.8
            }}
            className="flex md:flex-row flex-col-reverse justify-center gap-6 py-6">
              {/* Free plan */}

              <CardSpotlight className="md:h-100 md:w-96 mx-4 md:mx-0 text-wrap">
                <p className="text-xl font-bold relative z-20 mt-2 text-white">
                  Free
                </p>
                <div className="text-neutral-200 mt-4 relative z-20">
                  <p className="mb-2 text-md md:text-lg">
                    ₹0/{isMonthlySubscription ? "month" : "year"}
                  </p>
                  What you'll get with VideoTube free:
                  <ul className="list-none  mt-2 text-sm md:text-base">
                    <Step title="Watch videos without ads" />
                    <Step title="Free email alerts" />
                    <Step title="Free push notifications" />
                    <Step title="Real Time chats with Users" />
                  </ul>
                </div>

                <Button
                  onClick={() => router.push("/")}
                  className="mt-10 md:mt-16 text-center w-full relative z-20 text-sm"
                >
                  Get started for free
                </Button>
              </CardSpotlight>

              {/* Premium plan */}
              <CardSpotlight className="mx-4 md:mx-0 md:h-100 md:w-96">
                <p className="text-xl font-bold relative z-20 mt-2 text-white">
                  Premium
                </p>

                <div className="text-neutral-200 mt-4 relative z-20">
                  <p className="mb-2 text-md md:text-lg">
                    {isMonthlySubscription ? "₹129" : "₹999"}/
                    {isMonthlySubscription ? "month" : "year"}
                  </p>
                  What you'll get with VideoTube Premium:
                  <ul className="list-none  mt-2 text-sm md:text-base">
                    <Step title="No tweet limits" />
                    <Step title="AI Message Enhancer" />
                    <Step title="Watch videos without ads" />
                    <Step title="Free email alerts" />
                    <Step title="Free push notifications" />
                    <Step title="Real Time chats with Users" />
                  </ul>
                </div>
                <Button
                  onClick={() =>
                    isMonthlySubscription ? pay(12900) : pay(99900)
                  }
                  className="mt-4 text-center w-full relative z-20 text-sm"
                >
                  Get started with Premium
                </Button>
              </CardSpotlight>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
