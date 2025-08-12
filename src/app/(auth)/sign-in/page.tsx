'use client';

  import React, { useState } from "react";
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";
  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
  } from "../../../../components/ui/form";
  import { Input } from "../../../../components/ui/input";
  import { Button } from "../../../../components/ui/button";
  import { toast } from "sonner";
  import { Eye, EyeOff, Loader2 } from "lucide-react";
  import { useRouter } from "next/navigation";
  import { SigninSchema } from "@/schemas/SigninSchema";
  import {motion} from 'motion/react'
import OAuthProviders from "../../../../components/OAuthProviders";

  const page = () => {
    const form = useForm<z.infer<typeof SigninSchema>>({
      resolver: zodResolver(SigninSchema),
      defaultValues: {
        identifier : "",
        password : ""
      },
    });

    const [isSubmitting, setisSubmitting] = useState(false);
    const [forgetSubmitting, setforgetSubmitting] = useState(false)
    const [isPasswordVisible, setisPasswordVisible] = useState(false);

    const router = useRouter();

    const onSubmit = async (data: z.infer<typeof SigninSchema>) => {
      try {
        setisSubmitting(true);

        if (
          !data.identifier ||
          !data.password
        ) {
          toast.warning("All fields are required");
          return;
        }


        const dataa: any = await fetch("/api/auth/login", {
          method: "POST",
          headers : {
            "Content-Type" : "application/json"
          },
          body: JSON.stringify(data)
        });
        const res = await dataa.json();
        if (res.success) {
          toast.success("User Logged in successfully");
          router.push("/")
          return;
        }
        toast.error(res.message);
      } catch (error) {
        console.log(error);
      } finally {
        setisSubmitting(false);
      }
    };

    const forgotPassword = async() => {
      try {

        const identifier = form.getValues("identifier")
        if(!identifier || identifier.trim() == "" || identifier.length < 2){
          toast.warning("Please Enter your Email or Username before proceeding")
          return;
        }
        setforgetSubmitting(true)
        const response = await fetch(`/api/auth/forget-password/${identifier}`
        )
        const data = await response.json();
        
        if(data?.success){
          toast.success(data?.message);
          router.push(`reset-password/${data?.email}`)
          return;
        }
        console.log(data)
        toast.warning(data.message)
      } catch (error) {
        console.log("Error:",error)
      } finally {
        setforgetSubmitting(false)
        form.setValue("identifier","")
      }

    }

    return (
      <>
        <div className="h-screen w-screen justify-center flex items-center">
          <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            transition: { duration: 0.3, type: "spring", stiffness: 100 },
          }}
          exit={{ opacity: 0 , x: -100}}
          className="md:w-fit md:mx-auto mx-4 h-fit flex flex-col gap-6 dark:bg-[#161616] rounded-md px-6 justify-center py-6">
            <div className="flex flex-col justify-center space-y-0.5 items-center">
              <h2 className="text-2xl">Login to your Account</h2>
              <p className="text-sm">
                Don't have an Account?{" "}
                <span onClick={() => router.push("/sign-up")} className="duration-200 cursor-pointer hover:text-blue-500">
                  Signup
                </span>
              </p>
            </div>
            <div>
              <div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-6"
                  >

                      <FormField
                        control={form.control}
                        name="identifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="placeholder:text-[#A1A1A1]"
                                placeholder="Enter Email or Username"
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
                                  <Eye onClick={() => setisPasswordVisible(false)} className="right-2 opacity-50 w-5 absolute top-1.5" />
                                ) : (
                                  <EyeOff onClick={() => setisPasswordVisible(true)} className="right-2 opacity-50 w-5 absolute top-1.5" />
                                )}
                              </div>
                            </FormControl>
                            
                            <FormMessage />
                            {
                              !forgetSubmitting ? <div onClick={forgotPassword} className="text-sm text-gray-400 hover:text-gray-200 duration-400 cursor-pointer">Forgot Password?</div> : <Loader2  className="animate-spin size-5"/>
                            }
                          </FormItem>
                        )}
                      />
                


    

                      <Button disabled={isSubmitting} type="submit" className="md:mt-2 mt-1 w-full">
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" />
                        ): "Submit" }
                      </Button>
                  
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
          </motion.div>
        </div>
      </>
    );
  };

  export default page;
