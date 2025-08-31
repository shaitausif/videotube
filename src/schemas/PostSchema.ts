import z, { file } from "zod";

const postImage = z.file()

postImage.mime(["image/png","image/jpeg"])


export const postSchema = z.object({
    postImg : postImage,
    caption : z.string().min(5,"Caption must be atleast of 5 characters.").max(500,"Caption must be less than 500 characters."),
})