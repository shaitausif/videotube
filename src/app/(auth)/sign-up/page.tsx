'use client';

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema } from "@/schemas/SignupSchema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import OAuthProviders from "../../../../components/OAuthProviders";

const page = () => {
  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      avatar: undefined,
      coverImage: null,
    },
  });

  const [isSubmitting, setisSubmitting] = useState(false);
  const [isPasswordVisible, setisPasswordVisible] = useState(false);


  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof SignupSchema>) => {
    try {
      setisSubmitting(true);

      if (
        !data.avatar ||
        !data.email ||
        !data.fullName ||
        !data.username ||
        !data.password
      ) {
        toast.warning("All fields are required");
        return;
      }
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }
      if (data.coverImage) {
        formData.append("coverImage", data.coverImage);
      }

      formData.append("email", data.email);
      formData.append("password", data.password);

      const dataa: any = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });
      const res = await dataa.json();
      if (res.success) {
        toast.success(res.message);
        router.push(`/verify-code/${data.email}`);
        return;
      }
      toast.warning(res.message);
    } catch (error) {
      console.log(error);
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <>
      <div className="h-screen w-screen justify-center flex items-center pointer-events-auto">
       <div className="h-fit w-fit my-6 mx-2">
          <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.3, type: "spring", stiffness: 100 },
          }}
          exit={{ opacity: 0 , x: -100 }}
          
          className="card-wrapper flex justify-center items-center">
             <div
          
          className="md:w-[50vw] z-10 m-0.5 h-fit flex flex-col gap-6 dark:text-white dark:bg-[#161616] bg-white rounded-md px-6 justify-center py-6"
        >
          <div className="flex flex-col justify-center space-y-0.5 items-center">
            <h2 className="text-2xl">Create an Account</h2>
            <p className="text-sm">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/sign-in")}
                className="duration-200 cursor-pointer hover:text-blue-500"
              >
                Login
              </span>
            </p>
          </div>
          <div>
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col md:flex-row gap-6"
                >
                  {/* Left Side (Form Fields) */}
                  <div className="flex-1 space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              className="placeholder:text-[#A1A1A1]"
                              placeholder="Enter your fullname"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              className="placeholder:text-[#A1A1A1]"
                              placeholder="Enter your Username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              className="placeholder:text-[#A1A1A1]"
                              placeholder="Enter your Email ID"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative ">
                              <Input
                                className="placeholder:text-[#A1A1A1]"
                                placeholder="Enter the Password"
                                type={isPasswordVisible ? "text" : "password"}
                                {...field}
                              />
                              {isPasswordVisible ? (
                                <Eye
                                  onClick={() => setisPasswordVisible(false)}
                                  className="right-2 opacity-50 w-5 absolute top-1.5"
                                />
                              ) : (
                                <EyeOff
                                  onClick={() => setisPasswordVisible(true)}
                                  className="right-2 opacity-50 w-5 absolute top-1.5"
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Side (Avatar & Cover Image) */}
                  <div className="flex-1 space-y-6">
                    <FormField
                      control={form.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Avatar Image</FormLabel>
                          <FormControl>
                            <Input
                              className="placeholder:text-[#A1A1A1]"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                field.onChange(file); // send file to react-hook-form
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="coverImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Cover Image</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              className="placeholder:text-[#A1A1A1]"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                field.onChange(file); // send file to react-hook-form
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      className="md:mt-4 w-full"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
          {/* OAuth Options */}
          <div className="flex items-center gap-2 md:gap-3">
            <span className="h-px flex-1 bg-gray-300"></span>
            <span className="text-sm text-gray-500">OR</span>
            <span className="h-px flex-1 bg-gray-300"></span>
          </div>
          <div className="flex flex-col gap-3  justify-center items-center">
           <OAuthProviders />
          </div>
        </div>
          </motion.div>
       </div>
      </div>
    </>
  );
};

export default page;
