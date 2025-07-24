import { createSlice } from "@reduxjs/toolkit";
import mongoose from "mongoose";

export interface UserState {
        _id? : string;
      username?: string;
      email?: string;
      fullName?: string;
      avatar?: string;
      coverImage?: string;
      watchHistory?: Array<mongoose.Types.ObjectId>;
      password?: string;
      refreshToken?: string;
      VerifyCode?: string;
      VerifyCodeExpiry?: Date;
      isVerified?: boolean;
}


const initialState: UserState = {}


const userSlice = createSlice({
    name : "user",
    initialState,
    reducers : {
        // It will fill the state
        setUser : (state,action) => {
           return  {...action.payload}
        },
        // It will clear the state
        clearUser : (state) => {
            return {}
        }

    }
})


export const {setUser, clearUser} = userSlice.actions;
export default userSlice.reducer