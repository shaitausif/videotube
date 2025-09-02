import z from "zod";

export const TweetSchema = z.object({
    tweet : z.string().min(5,"Tweet must be atleast of 5 characters.").max(1000,"Tweet must be less than 1000 characters.")
})