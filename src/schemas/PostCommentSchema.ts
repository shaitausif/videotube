import { z } from "zod";


export const PostCommentSchema = z.object({
    comment : z.string().min(2, "Comment must be of atleast 2 Characters").max(500,"Comment must be less than 500 characters")
})