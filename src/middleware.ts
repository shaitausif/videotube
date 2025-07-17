import { NextRequest, NextResponse } from "next/server";
// Next.js middleware (like middleware.ts) runs on the Edge Runtime, which doesn't support jsonwebtoken. That's why jose is the recommended library for JWT in middleware.
import { jwtVerify } from "jose";
// getToken's Role: The getToken helper function is designed to read this JWT directly from the incoming request's cookies (or sometimes headers, depending on context and configuration). It then optionally verifies and decodes the token using your NEXTAUTH_SECRET.
import { getToken } from "next-auth/jwt";

const jsonSecret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);

async function verifyCustomJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, jsonSecret);
    if (!payload) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  console.log(pathname)


  // Try to get next-auth token for o-auth user
  const nextAuthToken = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const customToken = req.cookies.get("accessToken")?.value;
  const customJWT = customToken ? await verifyCustomJWT(customToken) : null;


  const userIsAuthenticated = !!nextAuthToken || !!customJWT;

  const publicRoutes = [
    "/sign-in",
    "/sign-up",
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/signup",    
  ];

  const wildcardRoutes = ["/reset-password","/verify-code"];

  const isPublic =
    publicRoutes.includes(pathname) ||
    wildcardRoutes.some((route) => pathname.startsWith(route));
  // If not authenticated and accessing not a public route then redirect to login page
  if (!userIsAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  

  // If authenticated and accessing login or signup page
  if (userIsAuthenticated && isPublic) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  // "These are exception routes it also includes "/" or homepage of the application"
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|$).*)"],
}