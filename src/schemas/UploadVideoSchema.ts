import z from "zod";

const videoFileSchema = z.file()

videoFileSchema.min(50000,"Video size must be greater than 500 KB's") // 500kb
videoFileSchema.max(100_000_000,"Video should be less than 100 MB's")  // 
videoFileSchema.mime(["video/mp4","video/webm"])


const thumbnailSchema = z.file()
thumbnailSchema.min(500)
thumbnailSchema.max(50_00_000)



export const UploadVideoSchema = z.object({
    title : z.string().min(10, "Title must be atleast of 10 characters.").max(100,"Title must be less than 100 characters."),
    description : z.string().min(10, "Description must be atleast of 10 characters.").max(1000, "Description must be less than 1000 characters."),
    videoFile : videoFileSchema,
    thumbnail : thumbnailSchema,
})