import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { User } from "@/app/models/user.model";
import { uploadOnCloudinary } from "@/lib/cloudinary";
import ConnectDB from "@/lib/dbConnect";
import { sendVerificationEmail } from "../../../../../helpers/SendVerificationEmail";

export async function POST(req: NextRequest) {
  try {
    const data: FormData = await req.formData();

    const avatarFile = data.get("avatar") as File;
    const coverImageFile = data.get("coverImage") as File;

    if (!avatarFile)
      return NextResponse.json(
        { success: false, message: "Avatar Image is required" },
        { status: 400 }
      );

    const fullName = data.get("fullName")?.toString().trim();
    const username = data.get("username")?.toString().trim();
    const email = data.get("email")?.toString().trim();
    const password = data.get("password")?.toString().trim();

    if (!fullName || !username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Check for the existing User
    await ConnectDB();
    const ExistingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    // if there is already a document of the user then won't allow anyone else to use   
    if (ExistingUser?.isVerified) {
      return NextResponse.json({
        success: false,
        message: "User with Email or Username already exists",
      });
    }

    const avatarArrayBuffer = await avatarFile.arrayBuffer();
    const avatarBuffer = Buffer.from(avatarArrayBuffer);
    const avatarFilePath = path.join(
      process.cwd(),
      "public",
      "temp",
      avatarFile.name
    );
    await fs.writeFile(avatarFilePath, avatarBuffer);
    const avatar = await uploadOnCloudinary(avatarFilePath);

    let coverImage = null;
    if (coverImageFile) {
      const coverImageArrayBuffer = await coverImageFile.arrayBuffer();
      const coverImageBuffer = Buffer.from(coverImageArrayBuffer);
      const coverImageFilePath = path.join(
        process.cwd(),
        "public",
        "temp",
        coverImageFile.name
      );
      await fs.writeFile(coverImageFilePath, coverImageBuffer);
      coverImage = await uploadOnCloudinary(coverImageFilePath);
    }

    if (!avatar)
      return NextResponse.json({
        success: false,
        message: "Failed to upload avatar on cloudinary",
      });


    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    const user = await User.create({
      fullName,
      username,
      email,
      password,
      avatar: avatar?.secure_url,
      coverImage: coverImage?.secure_url! || "",
      verifyCode : verificationCode,
    });

    const emailResponse = await sendVerificationEmail(email, username, verificationCode)

    if(!emailResponse.success){
      return NextResponse.json({
        success : false, message : emailResponse.message
      })
    }

    return NextResponse.json({
      success : true,
      message : "User registered successfully, Please verify your email"
    })

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: `Unable to register the User: ${error}`,
      },
      { status: 500 }
    );
  }
}
