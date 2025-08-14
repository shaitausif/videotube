import NextAuth, { NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";
import ConnectDB from "./dbConnect";
import { User } from "@/models/user.model";



export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!
  })
    // ...add more providers here
  ],

  callbacks : {
    async jwt({token, account, profile}) {
        // This only runs for Oauth logins
        if(account && profile){
            await ConnectDB();
            const email = profile.email;
            let user = await User.findOne({email})
            if(!user){
                user = await User.create({
                    email,
                    username : profile.given_name || profile.login || "No Username",
                    fullName : profile.name || profile.login || "Unnamed",
                    avatar : profile.picture || profile.avatar_url || "" ,
                    password : "",
                    VerifyCodeExpiry: undefined,
                    isVerified: true
                },{validateBeforeSave : false})
            }else{
              user.avatar = profile.picture || profile.avatar_url || ""
              await user.save();
            }

            //  Generate YOUR CUSTOM JWTs (accessToken, refreshToken)
        // Use your Mongoose user schema methods.
        const customAccessToken = await user.generateAccessToken();
        const customRefreshToken = await user.generateRefreshToken();
            token.accessToken = customAccessToken
            token.refreshToken = customRefreshToken;
            token._id = user._id.toString()
        }
        return token
    },

    async session({session, token}){
        if(session.user){
            session.user.id = token.id as string
        }
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        return session
    }

  },


  pages : {
    signIn : "/sign-in",
    error : "/" 
  },

  session : {
    strategy : "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret : process.env.NEXTAUTH_URL 
}

