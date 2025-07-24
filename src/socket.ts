// On the client side, all tips from our React guide are valid.

// The only difference is that you need to exclude the Socket.IO client from server-side rendering (SSR):

"use client"

import { io } from 'socket.io-client'

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URI,{
    withCredentials : true
})