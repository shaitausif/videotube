import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

// This endpoints main motive is to set the accessToken and refreshToken in user cookies when the user logs in using oauth providers because many of my express middlewares are looking for those cookies and I can't change them right now so I chose this alternate option
export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    const cookieStore = await cookies();
    const options = {
      httpOnly: true,
      secure: false,
    };
    if (!token || !token.accessToken) {
      // cookieStore.set("accessToken", token?.accessToken as string, options);
      // cookieStore.set("refreshToken", token?.refreshToken as string, options);
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    //   Now, setting my custom cookies in the user browser
    cookieStore.set("accessToken", token.accessToken as string, options);
    // cookieStore.set("refreshToken", token.refreshToken as string, options);

    return NextResponse.json(
      { success: true, message: "User cookies set successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unable to get the User Info" },
      { status: 500 }
    );
  }
}
