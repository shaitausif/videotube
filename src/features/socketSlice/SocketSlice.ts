import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of your socket state
export interface SocketState {
  isConnected: boolean;
  socketId: string | null;
  error? : string | null
  // You might want to store other socket-related info here, e.g.,
  // lastMessageReceived: string | null;
  // error: string | null;
}

const initialState: SocketState = {
  isConnected: false,
  socketId: null,
  error : null
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    // Action to set connection status
    setConnected: (state, action: PayloadAction<{ id: string }>) => {
      state.isConnected = true;
      state.socketId = action.payload.id;
    },

     // Action to set disconnected status
    setDisconnected: (state) => {
      state.isConnected = false;
      state.socketId = null;
    },

    setError : (state, action) => {
        state.isConnected = false;
        state.error = action.payload
    }
  },
});


export const { setConnected , setDisconnected , setError } = socketSlice.actions
export default socketSlice.reducer