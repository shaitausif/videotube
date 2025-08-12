import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { deleteFromCloudinary, uploadOnCloudinary } from "@/lib/cloudinary";
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

    // if (!coverImageFile)
    //   return NextResponse.json({
    //     success: false,
    //     message: "Cover Image File is required",
    //   });

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
    console.log(coverImage)
    // if (!coverImage) {
    //   return NextResponse.json({
    //     success: false,
    //     message: "Failed to upload Cover Image on cloudinary",
    //   },{status : 500});
    // }

    await ConnectDB();
    const user = await User.findById(payload?._id);
    const oldCoverImage = user.coverImage;
    const deleted = await deleteFromCloudinary(oldCoverImage);
    // if(oldCoverImage){
    //   if(deleted.result !== "ok"){
    //   return NextResponse.json({success : false, message : "Unable to delete the old CoverImage from the cloudinary"},{status : 400})
    // }
    // }

    user.coverImage = coverImage?.url;
    console.log("CoverImage Updated successfully");
    await user.save({ validateBeforeSave: false });
    console.log(user.coverImage);
    return NextResponse.json({
      success: true,
      data: coverImage?.url,
      message: "Cover Image updated successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: error },
      { status: 500 }
    );
  }
}
