
import NextAuth, {DefaultSession} from "next-auth"

// Next auth give us sessions but here in this application I want to use jwt instead of sessions
// So here I can extend the session object to add some new properties to it
declare module "next-auth" {
 
  interface Session {
    user: {
      id: string
    //   Here, I want that my session should have the user object with id
    } & DefaultSession["user"],
    accessToken : any,
    refreshToken : any
  }

  interface Profile{
    name? : string,
    login? : string,
    picture? : string,
    given_name? : string,
    avatar_url? : string
  }
}