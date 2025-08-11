import { NextRequest , NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { uploadOnCloudinary } from "@/lib/cloudinary";
import ConnectDB from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { User } from "@/models/user.model";

export async function PUT(req: NextRequest) {
  try {
    const payload = await getCurrentUser(req);
    if (!payload)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    const data: FormData = await req.formData();
  
    if (!data)
      return NextResponse.json(
        { success: false, message: "Form Data is requrired" },
        { status: 400 }
      );
  
    const coverImageFile = data.get("coverImage") as File;
  
    if (!coverImageFile)
      return NextResponse.json({
        success: false,
        message: "Cover Image File is required",
      });
  
    const coverImageArrayBuffer = await coverImageFile.arrayBuffer();
    const coverImageBuffer = Buffer.from(coverImageArrayBuffer);
    const coverImageFilePath = path.join(
      process.cwd(),
      "public",
      "temp",
      coverImageFile.name
    );
    await fs.writeFile(coverImageFilePath, coverImageBuffer);
    // After uploading the file on local machine let's upload it on cloudinary as well
    const coverImage = await uploadOnCloudinary(coverImageFilePath);
  
    if (!coverImage) {
      return NextResponse.json({
        success: false,
        message: "Failed to upload Cover Image on cloudinary",
      });
    }
  
    await ConnectDB();
    const user = await User.findByIdAndUpdate(
      payload._id, // Pass ID directly
      { coverImage: coverImage.secure_url },
      { new: true } // optional: returns the updated document
    );
  
    return NextResponse.json({success : true,data : user.coverImage, message : "Cover Image updated successfully"})
  } catch (error) {
    return NextResponse.json({success : false , message : error},{status : 500})
  }
}
