import { AxiosResponse } from "axios";
import { FreeAPISuccessResponseInterface } from "@/interfaces/api";
import { store } from "@/store/store";
import { clearUser } from "@/features/userSlice/UserSlice";
import { ChatListItemInterface } from "@/interfaces/chat";
import { UserInterface } from "@/interfaces/user";
// No LocalStorage import here for authentication purposes. but if needed for any other stuff i can use that as well


// requestHandler: It's a wrapper for your Axios calls to standardize UI feedback (loading, success, error messages) and authentication redirects.
export const requestHandler = async(
    api : () => Promise<AxiosResponse<FreeAPISuccessResponseInterface>>,
    setLoading : ((loading: boolean) => void) | null,
    onSuccess : (data: FreeAPISuccessResponseInterface) => void,
    onError: (error: string) => void
) => {

    // Showing loading state if the loading function is provided
    setLoading && setLoading(true)
    try {
        const res = await api()
        const { data } = res;
        if(data.success) {
            // Call the onSuccess callback with the response data
            onSuccess(data) 
        }
    } catch (error: any) {
        // Handle error case
        if([401,403].includes(error.res?.data.statusCode)){
            // As i am not using localStorage for storing user's information I am using redux store for that that's why i am going to use useDispatch to clear the user if the user found to be unauthorized
            store.dispatch(clearUser())
            if(isBrowser) window.location.href = '/sign-in'
        }
        onError(error.res.data.message || "Something Went wrong")
    } finally {

        setLoading && setLoading(false)
    }
}


export const isBrowser = typeof window !== 'undefined'

// A utility function to concatenate CSS class names with proper spacing
export const classNames = (...className: string[]) => {
  // `className.filter(Boolean)`
  // This filters out any values that are "falsy" (like `false`, `null`, `undefined`, `""`, `0`).
  // So, if you pass `classNames("btn", isPrimary && "btn-primary", false, "large")`,
  // it will become `["btn", "btn-primary", "large"]`.
  return className.filter(Boolean).join(" ");
  // `.join(" ")`
  // Joins the remaining strings with a space to form a valid CSS class string.
  // Result: "btn btn-primary large"
};



// This utility function generates metadata for chat objects.
// It takes into consideration both group chats and individual chats.
export const getChatObjectMetaData = (
    chat: ChatListItemInterface, // The chat item for which metadata is being generated.
    loggedInUser : any // The currently logged-in user details.
) => {
      // Determine the content of the last message, if any.
  // If the last message contains only attachments, indicate their count.
    const lastMessage = chat.lastMessage?.content ? chat.lastMessage.content : 
        chat.lastMessage ? `${chat.lastMessage.attachments?.length} attachment${
            chat.lastMessage.attachments.length > 1 ? "s" : ""
        }` : "No messages yet"  // Placeholder text if there are no messages.

    if(chat.isGroupChat) {
    // Case: Group chat
    // Return metadata specific to group chats.
    return {
        // Default avatar for group chats
        avatar : "https://cdn-icons-png.flaticon.com/128/4121/4121044.png",
        title : chat.name,
        description : `${chat.participants.length} members in the chat`,//Description indicates the number of members
        lastMessage: chat.lastMessage ? chat.lastMessage.sender.username + ": " + lastMessage : lastMessage
    }
    }
    else{
        // Case : Individual chat
        // Identify the participant other than logged in user
        const participant = chat.participants.find((p) => p._id !== loggedInUser._id)
        // Return the metadata specific to the Individual chat
        return {
            avatar : participant?.avatar,
            title : participant?.username,
            description : participant?.email,
            lastMessage
        }
    }
};



// A class that provides utility functions for working with local storage
export class LocalStorage {
    // Get a value from local storage by key
    static get(key: string){
        if(!isBrowser) return;
        const value = localStorage.getItem(key)
        if(value){
            try {
                return JSON.parse(value)
            } catch (error) {
                return null
            }
        }
        return null
    }

    // Set a value in local storage by key
    static set(key: string, value: any){
        if(!isBrowser) return 
        localStorage.setItem(key, JSON.stringify(value))
    }

    // Remove a value from local storage by key
    static remove(key: string){
        if(!isBrowser) return;
        localStorage.removeItem(key)
    }


    // Clear all items from localStorage
    static clear(){
        if(!isBrowser) return
        localStorage.clear()
    }

}