import { z } from "zod";


export const SigninSchema = z.object({
    

    identifier: z.string().toLowerCase().min(2, {message : "Username must be greater than 2 characters"}).max(30, 
        {message : "Username must be less than 30 characters"}
    ),
    password : z.string().min(8,{ message : "Password must be greater than 8 characters"}).max(20, {message : "Password must be less than 20 characters"}),
    
})