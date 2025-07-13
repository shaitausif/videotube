import { z } from "zod";


export const SignupSchema = z.object({
    fullName :  z.string().min(2, {message  : "FullName must be greater than 2 characters"}).max(30, {message : "FullName must be less than 30 characters"}),

    username: z.string().toLowerCase().min(2, {message : "Username must be greater than 2 characters"}).max(30, 
        {message : "Username must be less than 30 characters"}
    ),

    email : z.string().email(),
    password : z.string().min(8,{ message : "Password must be greater than 8 characters"}).max(20, {message : "Password must be less than 20 characters"}),

    avatar: z
  .custom<File>(
    (file) =>
      file instanceof File &&
      file.size > 0 &&
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    { 
      message: "Avatar must be a valid JPG, PNG, or WebP file",
    }
  ),
    coverImage : z.any().optional()
    
})