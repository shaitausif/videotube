import { z } from "zod";


export const ResetPasswordSchema = z.object({
    password: z.string().min(8,"Password must be greater than 8 characters").max(16,"Password must be less than 16 characters"),
    
    confirmPassword : z.string().min(8,"Password must be greater than 8 characters").max(16,"Password must be less than 16 characters"),
})