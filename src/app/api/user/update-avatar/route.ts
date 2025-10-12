import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { deleteFromCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
import ConnectDB from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { User } from "@/models/user.model";

export async function PUT(req: NextRequest) {
  try {
    const {payload, cookies} = await getCurrentUser(req);
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
  
    const avatarFile = data.get("avatar") as File;
  
    if (!avatarFile)
      return NextResponse.json({
        success: false,
        message: "Avatar File is required",
      });
  
    const avatarArrayBuffer = await avatarFile.arrayBuffer();
    const avatarBuffer = Buffer.from(avatarArrayBuffer);
    const avatarFilePath = path.join(
      process.cwd(),
      "public",
      "temp",
      avatarFile.name
    );
    await fs.writeFile(avatarFilePath, avatarBuffer);
    // After uploading the file on local machine let's upload it on cloudinary as well
    const avatar = await uploadOnCloudinary(avatarFilePath);
  
    if (!avatar) {
      return NextResponse.json({
        success: false,
        message: "Failed to upload avatar on cloudinary",
      });
    }
  
    await ConnectDB();
    const user = await User.findById(payload?._id)
    const oldAvatar = user.avatar
    const deleted = await deleteFromCloudinary(oldAvatar)
    // if(deleted.result !== "ok") return NextResponse.json({success : false, message : "Unable to delete the old avatar."},{status : 500})

    // Now, as the Old one has been deleted then, update the new one
    user.avatar = avatar.url
    await user.save({validateBeforeSave : false})

    return NextResponse.json({success : true,data: avatar?.url, message : "Avatar updated successfully"})
  } catch (error) {
    return NextResponse.json({success : false , message : error},{status : 500})
  }
}
