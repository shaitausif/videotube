import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import ConnectDB from "../dbConnect";
import { User } from "@/models/user.model";
import { generateAccessAndRefreshTokens } from "../server/generateTokens";
import { accessTokenOptions, refreshTokenOptions } from "@/utils";

const jsonSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

// This function is for verifying whether the user is authenticated or not and it also refreshes the tokens using refresh Tokens
// It returns an object containing the payload and (optionally) an array of cookies the caller should set on its response.
export const getCurrentUser = async (
  req: NextRequest
): Promise<{
  payload: {
    _id: string;
    email: string;
    username: string;
    fullName: string;
  } | null;
  cookies?: Array<{ name: string; value: string; options?: any }>;
}> => {
  const customJWTToken = req.cookies.get("accessToken")?.value;
  const nextAuthToken = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  try {
    if (!!customJWTToken) {
      const { payload } = await jwtVerify(customJWTToken, jsonSecret);
      return {
        payload: payload as {
          _id: string;
          email: string;
          username: string;
          fullName: string;
        },
      };
    } else if (!!nextAuthToken)
      return {
        payload: nextAuthToken as {
          _id: string;
          email: string;
          username: string;
          fullName: string;
        },
      };

    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!!refreshToken) {
      const newTokens = await refreshAccessToken(refreshToken);
      if (newTokens) {
        // Return tokens so the caller can attach them to the response
        return {
          payload: newTokens.payload as {
            _id: string;
            email: string;
            username: string;
            fullName: string;
          },
          cookies: [
            {
              name: "accessToken",
              value: newTokens.accessToken,
              options: accessTokenOptions,
            },
            {
              name: "refreshToken",
              value: newTokens.refreshToken,
              options: refreshTokenOptions,
            },
          ],
        };
      }
      return { payload: null };
    }

    return { payload: null };
  } catch (error) {
    return { payload: null };
  }
};

export const refreshAccessToken = async (refreshToken: any) => {
  try {
    await ConnectDB();

    const refreshJson = new TextEncoder().encode(
      process.env.REFRESH_TOKEN_SECRET!
    );

    const { payload } = await jwtVerify(refreshToken, refreshJson);

    const user = await User.findById(payload._id);
    // if(!user || refreshToken !== user.refreshToken) return null

    const tokens = await generateAccessAndRefreshTokens(user);

    return {
      accessToken: tokens?.accessToken,
      refreshToken: tokens?.refreshToken,
      payload: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
    };
  } catch (error) {
    return null;
  }
};
