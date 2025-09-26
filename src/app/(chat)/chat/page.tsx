"use client";
import React, { useEffect, useRef, useState } from "react";
import { socket } from "@/socket";
import { ChatListItemInterface, ChatMessageInterface } from "@/interfaces/chat";
import { toast } from "sonner";
import {
  classNames,
  getChatObjectMetaData,
  LocalStorage,
  requestHandler,
  streamRequestHandler,
} from "@/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  createorGetAIChat,
  deleteMessage,
  enhanceMessages,
  getChatMessages,
  getUserChats,
  sendAIMessage,
  sendMessage,
} from "@/lib/apiClient";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Input from "../../../../components/chats/Input";
import AddChatModal from "../../../../components/chats/AddChatModal";
import Typing from "../../../../components/chats/Typing";
import ChatItem from "../../../../components/chats/ChatItem";
import MessageItem from "../../../../components/chats/MessageItem";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import Image from "next/image";
import { Icon, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CONNECTED_EVENT = "connected";
const DISCONNECT_EVENT = "disconnect";
const JOIN_CHAT_EVENT = "joinChat";
const NEW_CHAT_EVENT = "newChat";
const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
const LEAVE_CHAT_EVENT = "leaveChat";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
const MESSAGE_DELETE_EVENT = "messageDeleted";

const page = () => {
  const user = useSelector((state: RootState) => state.user);

  // Create a reference using 'useRef' to hold the currently selected chat.
  // 'useRef' is used here because it ensures that the 'currentChat' value within socket event callbacks
  // will always refer to the latest value, even if the component re-renders.
  const currentChat = useRef<ChatListItemInterface | null>(null);

  // To keep track of the setTimeout function
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define state variables and their initial values using 'useState'
  const [isConnected, setIsConnected] = useState(false); // For tracking socket connection

  const [openAddChat, setOpenAddChat] = useState(false); // To control the 'Add Chat' modal
  const [loadingChats, setLoadingChats] = useState(false); // To indicate loading of chats
  const [loadingMessages, setLoadingMessages] = useState(false); // To indicate loading of messages

  const [chats, setChats] = useState<ChatListItemInterface[]>([]); // To store user's chats
  const [messages, setMessages] = useState<ChatMessageInterface[] | any[]>([]); // To store chat messages
  const [unreadMessages, setUnreadMessages] = useState<ChatMessageInterface[]>(
    []
  ); // To track unread messages

  const [isTyping, setIsTyping] = useState(false); // To track if someone is currently typing
  const [selfTyping, setSelfTyping] = useState(false); // To track if the current user is typing

  const [message, setMessage] = useState(""); // To store the currently typed message
  const [localSearchQuery, setLocalSearchQuery] = useState(""); // For local search functionality

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]); // To store files attached to messages
  const [isSendingMessageToAI, setisSendingMessageToAI] = useState(false);
  const [isInChat, setisInChat] = useState(false);
  const [isLoadingMessage, setisLoadingMessage] = useState(false);
  const router = useRouter();



  /**
   *  A  function to update the last message of a specified chat to update the chat list
   */

  const updateChatLastMessage = (
    chatToUpdateId: string,
    message: ChatMessageInterface // The new message to be set as the last message
  ) => {
    // Search for the chat with the given ID in the chats array
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId)!;

    // Update the 'lastMessage' field of the found chat with the new message
    chatToUpdate.lastMessage = message;

    // Update the 'updatedAt' field of the chat with the 'updatedAt' field from the message
    chatToUpdate.updatedAt = message?.updatedAt;

    // Update the state of chats, placing the updated chat at the beginning of the array
    setChats([
      chatToUpdate, // Place the updated chat first
      ...chats.filter((chat) => chat._id !== chatToUpdateId), // Include all other chats except the updated one
    ]);
  };
  /**
   *A function to update the chats last message specifically in case of deletion of message *
   **/

  const updateChatLastMessageOnDeletion = (
    chatToUpdateId: string, //ChatId to find the chat
    message: ChatMessageInterface //The deleted message
  ) => {
    // Search for the chat with the given ID in the chats array
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId)!;

    //Updating the last message of chat only in case of deleted message and chats last message is same
    if (chatToUpdate.lastMessage?._id === message._id) {
      requestHandler(
        async () => getChatMessages(chatToUpdateId),
        null,
        (res) => {
          const { data } = res;

          chatToUpdate.lastMessage = data[0];
          setChats([...chats]);
        },
        (error) => {
          // @ts-ignore
          toast.error(error.message);
        }
      );
    }
  };
  const getChats = async () => {
    requestHandler(
      async () => await getUserChats(),
      setLoadingChats,
      (res) => {
        const { data } = res;
        setChats(data || []);

        // If user's localStorage contains a chat which doesn't exists in the user's chat then remove the currentChat from localStorage
        const _currentChat = LocalStorage.get("currentChat");
        if (_currentChat) {
          const isChatExist = data.find(
            (data: any) => data._id === currentChat.current?._id || ""
          );
          if (!isChatExist) {
            LocalStorage.remove("currentChat");
            currentChat.current = null;
          }
        }
      },
      (error) => {
        // @ts-ignore
        toast.error(error.message);
      }
    );
  };

  const getMessages = async () => {
    // Check if a chat is selected, if not, show an alert
    if (!currentChat.current?._id) return toast("No Chat is selected");

    // Check if socket is available, if not, show an alert
    if (!socket) return toast.warning("Socket not available");

    // Emit an event to join the current chat
    socket.emit(JOIN_CHAT_EVENT, currentChat.current?._id);

    // Filter out unread messages from the current chat as those will be read
    setUnreadMessages(
      unreadMessages.filter((msg) => msg.chat !== currentChat.current?._id)
    );

    // Make an async request to fetch chat messages for the current chat
    requestHandler(
      // Fetching messages for the current chat
      async () => await getChatMessages(currentChat.current?._id || ""),
      // Set the state to loading while fetching the messages
      setLoadingMessages,
      // After fetching, set the chat messages to the state if available
      (res) => {
        const { data } = res;
        setMessages(data || []);
        console.log(data)
      },
      // Display any error toasts if they occur during the fetch
      // @ts-ignore
      (err) => toast.error(err.message)
    );
  };

  const handleEnhanceMessage = async (content: string) => {
    if (!content || content.length < 4) return toast.warning("Content length is too short!");
    setMessage("")
    requestHandler(
      async () => await enhanceMessages(content),
      setisLoadingMessage,
      (res) => {
        setMessage(res.data);
      },
      (err) => {
        // @ts-ignore
        toast.error(err.message);
        console.log(err);
      }
    );
  };

  // Function to send Message to the AI and then get the response on that message
  // const sendAIChatMessage = async () => {
  //   // If no current chat ID exists or there's no socket connection, exit the function
  //   if (!currentChat.current?._id || !socket)
  //     return toast.warning("No chat is selected");
  //   // Emit a STOP_TYPING_EVENT to inform other users/participants that typing has stopped
  //   socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

  //   if (!message) return toast.warning("Enter the message first");

  //   await requestHandler(
  //     async () => await sendAIMessage(currentChat.current?._id || "", message),
  //     setisSendingMessageToAI,
  //     (res) => {
  //       // setMessages((prev) => [...res.data, ...prev]); // Updating message in the UI
  //       // updateChatLastMessage(currentChat.current?._id || "", res.data[0]);

        
  //       setMessages((prev) => [res.data, ...prev]); // Updating message in the UI
  //       updateChatLastMessage(currentChat.current?._id || "", res.data);
  //     },
  //     // @ts-ignore
  //     (error) => toast.error(error.message)
  //   );
  // };

  const sendAIChatMessage = async() => {  
    if(!currentChat.current?._id || !socket){
      return toast.warning("No chat is selected")
    }

    socket.emit(STOP_TYPING_EVENT, currentChat.current._id)

    if(!message) return toast.warning("Enter the message first")
      
     let isFirstChunk = true; // <-- local flag for this request only

    await streamRequestHandler(
      () => fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/chat-app/messages/ai/${currentChat.current?._id}`,{
        method : "POST",
        headers : {
          "Content-Type" : "application/json"
        },
        credentials : "include",
        body : JSON.stringify({content: message})
      }),
      setisSendingMessageToAI,
      (chunk) => {
      
        if(isFirstChunk){
          isFirstChunk = false
          console.log("New AI message")
          setMessages((prev) => [
            {_id : Date.now(), chat : currentChat.current?._id , content : chunk, sender : { _id : process.env.NEXT_PUBLIC_AI_BOT_ID, email : "ai@gmail.com", username : "AI Chatbot", avatar : 'https://res.cloudinary.com/dhrkajjwf/image/upload/v1754904646/u1e2b0j7sucyxczibwe9.jpg'}},
          ...prev
          ])
          
          return;
        }else {
          console.log("Old chunks")
          setMessages((prev) => [
          { ...prev[0] , content: (prev[0].content || "") + chunk},
          ...prev.slice(1)
        ]); // Updating message in the UI
        }

        
      },
      (finalText, id) => {
        console.log("Final text arrived")
         setMessages((prev) => [
        {   ...prev[0], content: finalText, _id : id},
        ...prev.slice(1),
      ]);
      
      },
      (error) => {
        toast.error(error)
        console.log(error)
      }
    )

  }


  // Function to send a chat message
  const sendChatMessage = async () => {
    // If no current chat ID exists or there's no socket connection, exit the function
    if (!currentChat.current?._id || !socket)
      return toast.warning("No chat is selected");

    if (!message && attachedFiles.length <= 0)
      return toast.warning("Message or Attachment is required");

    // Emit a STOP_TYPING_EVENT to inform other users/participants that typing has stopped
    socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

    // Use the requestHandler to send the message and handle potential response or error
    await requestHandler(
      // Try to send the chat message with the given message and attached files
      async () =>
        await sendMessage(
          currentChat.current?._id || "", // Chat ID or empty string if not available
          message, // Actual text message
          attachedFiles // Any attached files
        ),
      null,
      // On successful message sending, clear the message input and attached files, then update the UI
      (res) => {
        // Clear the message input
        setAttachedFiles([]); // Clear the list of attached files
        setMessages((prev) => [res.data, ...prev]); // Update messages in the UI
        updateChatLastMessage(currentChat.current?._id || "", res.data); // Update the last message in the chat
      },

      // If there's an error during the message sending process, raise a toast
      (err) => {
        // @ts-ignore
        toast.error(err.message);
      }
    );
  };
  const deleteChatMessage = async (message: ChatMessageInterface) => {
    //ONClick delete the message and reload the chat when deleteMessage socket gives any response in chat.tsx
    //use request handler to prevent any errors

    await requestHandler(
      async () => await deleteMessage(message.chat, message._id),
      null,
      (res) => {
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== res?.data?._id || "")
        );
        updateChatLastMessageOnDeletion(message.chat, message);
      },
      (err) => {
        // @ts-ignore
        toast.error(err.message);
      }
    );
  };

  const handleOnMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the message state with the current input value

    // If socket doesn't exist or isn't connected, exit the function
    if (!socket || !isConnected) return;

    // Check if the user isn't already set as typing
    if (!selfTyping) {
      // Set the user as typing
      setSelfTyping(true);

      // Emit a typing event to the server for the current chat
      socket.emit(TYPING_EVENT, currentChat.current?._id);
    }

    // Clear the previous timeout (if exists) to avoid multiple setTimeouts from running
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Define a length of time (in milliseconds) for the typing timeout
    const timerLength = 3000;

    // Set a timeout to stop the typing indication after the timerLength has passed
    typingTimeoutRef.current = setTimeout(() => {
      // Emit a stop typing event to the server for the current chat
      socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

      // Reset the user's typing state
      setSelfTyping(false);
    }, timerLength);
  };

  const onConnect = () => {
    setIsConnected(true);
  };

  const onDisconnect = () => {
    setIsConnected(false);
  };

  /**
   * Handles the "typing" event on the socket.
   */
  const handleOnSocketTyping = (chatId: string) => {
    // Check if the typing event is for the currently active chat.
    if (chatId !== currentChat.current?._id) return;

    // Set the typing state to true for the current chat.
    setIsTyping(true);
  };

  /**
   * Handles the "stop typing" event on the socket.
   */
  const handleOnSocketStopTyping = (chatId: string) => {
    // Check if the stop typing event is for the currently active chat.
    if (chatId !== currentChat.current?._id) return;

    // Set the typing state to false for the current chat.
    setIsTyping(false);
  };

  const onMessageDelete = (message: ChatMessageInterface) => {
    if (message?.chat !== currentChat.current?._id) {
      setUnreadMessages((prev) =>
        prev.filter((msg) => msg._id !== message._id)
      );
    } else {
      setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
    }

    updateChatLastMessageOnDeletion(message.chat, message);
  };

  /**
   * Handles the event when a new message is received.
   */
  const onMessageReceived = (message: ChatMessageInterface) => {
    // Check if the received message belongs to the currently active chat
    if (message?.chat !== currentChat.current?._id) {
      // If not, update the list of unread messages
      setUnreadMessages((prev) => [message, ...prev]);
    } else {
      // If it belongs to the current chat, update the messages list for the active chat

      setMessages((prev) => [message, ...prev]);
    }

    // Update the last message for the chat to which the received message belongs
    updateChatLastMessage(message.chat || "", message);
  };

  const onNewChat = (chat: ChatListItemInterface) => {
    setChats((prev) => [chat, ...prev]);
  };

  // This function handles the event when a user leaves a chat.
  const onChatLeave = (chat: ChatListItemInterface) => {
    // Check if the chat the user is leaving is the current active chat.
    if (chat._id === currentChat.current?._id) {
      // If the user is in the group chat they're leaving, close the chat window.
      currentChat.current = null;
      // Remove the currentChat from local storage.
      LocalStorage.remove("currentChat");
    }
    // Update the chats by removing the chat that the user left.
    setChats((prev) => prev.filter((c) => c._id !== chat._id));
  };

  // Function to handle changes in group name
  const onGroupNameChange = (chat: ChatListItemInterface) => {
    // Check if the chat being changed is the currently active chat
    if (chat._id === currentChat.current?._id) {
      // Update the current chat with the new details
      currentChat.current = chat;

      // Save the updated chat details to local storage
      LocalStorage.set("currentChat", chat);
    }

    // Update the list of chats with the new chat details
    setChats((prev) => [
      // Map through the previous chats
      ...prev.map((c) => {
        // If the current chat in the map matches the chat being changed, return the updated chat
        if (c._id === chat._id) {
          return chat;
        }
        // Otherwise, return the chat as-is without any changes
        return c;
      }),
    ]);
  };

  const createAIChat = async () => {
    await requestHandler(
      async () => await createorGetAIChat(),
      null,
      (res) => {
        console.log(res.message);
      },
      // @ts-ignore
      (error) => toast.error(error.message)
    );
  };

  useEffect(() => {
    // Fetch the chat list from the server.
    const starterFunction = async () => {
      createAIChat();

      await getChats();
      const _currentChat = LocalStorage.get("currentChat");
      // If there's a current chat saved in local storage:
      if (_currentChat) {
        // Set the current chat reference to the one from local storage.
        currentChat.current = _currentChat;
        // If the socket connection exists, emit an event to join the specific chat using its ID.
        socket?.emit(JOIN_CHAT_EVENT, _currentChat.current?._id);
        // Fetch the messages for the current chat.
        getMessages();
      }
    };
    starterFunction();
    // An empty dependency array ensures this useEffect runs only once, similar to componentDidMount.
  }, []);

  // Second useEffect to handle logic that depends on the 'chats' state
  // useEffect(() => {
  //   // This code will only run after 'chats' has been updated
  //   if (chats.length > 0) { // Check if chats has been populated
  //     const _currentChat = LocalStorage.get("currentChat");
  //     if(_currentChat){
  //       const isChatExist = chats.find((chat) => chat._id === _currentChat._id);

  //     if (!isChatExist) {
  //       localStorage.removeItem("currentChat");
  //       currentChat.current = null;
  //       return;
  //     }
  //     currentChat.current = _currentChat;
  //       setisInChat(true)
  //       socket?.emit(JOIN_CHAT_EVENT, _currentChat.current?._id);
  //       getMessages();
  //   }

  //   }
  // }, []); // Dependency array includes 'chats'

  // This useEffect handles the setting up and tearing down of socket event listeners.
  useEffect(() => {
    // If the socket isn't initialized, we don't set up listeners.
    if (!socket) return;

    // Set up event listeners for various socket events:
    // Listener for when the socket connects.
    socket.on(CONNECTED_EVENT, onConnect);
    // Listener for when the socket disconnects.
    socket.on(DISCONNECT_EVENT, onDisconnect);
    // Listener for when a user is typing.
    socket.on(TYPING_EVENT, handleOnSocketTyping);
    // Listener for when a user stops typing.
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    // Listener for when a new message is received.
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    // Listener for the initiation of a new chat.
    socket.on(NEW_CHAT_EVENT, onNewChat);
    // Listener for when a user leaves a chat.
    socket.on(LEAVE_CHAT_EVENT, onChatLeave);
    // Listener for when a group's name is updated.
    socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
    //Listener for when a message is deleted
    socket.on(MESSAGE_DELETE_EVENT, onMessageDelete);
    // When the component using this hook unmounts or if `socket` or `chats` change:
    return () => {
      // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off(TYPING_EVENT, handleOnSocketTyping);
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off(NEW_CHAT_EVENT, onNewChat);
      socket.off(LEAVE_CHAT_EVENT, onChatLeave);
      socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
      socket.off(MESSAGE_DELETE_EVENT, onMessageDelete);
    };

    // Note:
    // The `chats` array is used in the `onMessageReceived` function.
    // We need the latest state value of `chats`. If we don't pass `chats` in the dependency array,
    // the `onMessageReceived` will consider the initial value of the `chats` array, which is empty.
    // This will not cause infinite renders because the functions in the socket are getting mounted and not executed.
    // So, even if some socket callbacks are updating the `chats` state, it's not
    // updating on each `useEffect` call but on each socket call.
  }, [socket, chats]);

  return (
    <>
      <AddChatModal
        open={openAddChat}
        onClose={() => {
          setOpenAddChat(false);
        }}
        onSuccess={() => {
          getChats();
        }}
      />

      <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0">
        <div
          className={`${isInChat ? "hidden" : "block"} md:block w-full md:w-1/3 relative dark:ring-white overflow-y-auto px-4`}
        >
          <div className="z-10 w-full sticky top-0  py-4 flex justify-between items-center gap-4">
            <Input
              placeholder="Search user or group..."
              value={localSearchQuery}
              onChange={(e) =>
                setLocalSearchQuery(e.target.value.toLowerCase())
              }
            />
            <button
              onClick={() => setOpenAddChat(true)}
              className="rounded-md md:rounded-xl border-none bg-purple-700 hover:bg-purple-700/80 transition-all text-white py-1 px-2 md:py-3 md:px-4 flex flex-shrink-0"
            >
              + Add chat
            </button>
          </div>
          {loadingChats ? (
            <div className="flex justify-center items-center h-[calc(100%-88px)]">
              <Typing />
            </div>
          ) : (
            // Iterating over the chats array
            [...chats]
              // Filtering chats based on a local search query
              .filter((chat) =>
                // If there's a localSearchQuery, filter chats that contain the query in their metadata title
                localSearchQuery
                  ? getChatObjectMetaData(chat, user)
                      .title?.toLocaleLowerCase()
                      ?.includes(localSearchQuery)
                  : // If there's no localSearchQuery, include all chats
                    true
              )
              .map((chat) => {
                return (
                  <ChatItem
                    chat={chat}
                    isActive={chat._id === currentChat.current?._id}
                    unreadCount={
                      unreadMessages.filter((n) => n.chat === chat._id).length
                    }
                    onClick={(chat) => {
                      if (
                        currentChat.current?._id &&
                        currentChat.current?._id === chat._id
                      )
                        return;
                      LocalStorage.set("currentChat", chat);
                      currentChat.current = chat;
                      setMessage("");

                      getMessages();
                      setisInChat(true);
                    }}
                    key={chat._id}
                    onChatDelete={(chatId) => {
                      setChats((prev) =>
                        prev.filter((chat) => chat._id !== chatId)
                      );
                      if (currentChat.current?._id === chatId) {
                        currentChat.current = null;
                        LocalStorage.remove("currentChat");
                      }
                    }}
                  />
                );
              })
          )}
        </div>
        <div
          className={`${isInChat ? "block" : "hidden"} w-full md:block md:w-2/3 border-l-[0.1px] border-secondary`}
        >
          {currentChat.current && currentChat.current?._id ? (
            <>
              <div className="p-4 sticky top-0 bg-dark z-20 flex justify-between items-center w-full border-b-[0.1px] border-secondary">
                <div className="flex justify-start items-center w-max gap-3">
                  {currentChat.current.isGroupChat ? (
                    <div className="w-12 relative h-12 flex-shrink-0 flex justify-start items-center flex-nowrap">
                      {currentChat.current.participants
                        .slice(0, 3)
                        .map((participant, i) => {
                          return (
                            <Image
                              alt="Group Icon"
                              height={30}
                              width={30}
                              key={participant._id}
                              src={participant.avatar!}
                              className={classNames(
                                "w-9 h-9 border-[1px] object-cover border-white rounded-full absolute outline-4 outline-dark",
                                i === 0
                                  ? "left-0 z-30"
                                  : i === 1
                                    ? "left-2 z-20"
                                    : i === 2
                                      ? "left-4 z-10"
                                      : ""
                              )}
                            />
                          );
                        })}
                    </div>
                  ) : (
                    <Image
                      onClick={() => {
                        if (currentChat.current?.isGroupChat) return;
                        const otherUser =
                          currentChat.current?.participants.find(
                            (p) => p.username !== user.username
                          );
                        if (
                          otherUser?._id === process.env.NEXT_PUBLIC_AI_BOT_ID
                        )
                          return;
                        router.push(`/c/${otherUser?.username}`);
                      }}
                      alt="Profile Icon"
                      height={40}
                      width={40}
                      className="h-14 w-14 rounded-full flex flex-shrink-0 object-cover"
                      src={
                        getChatObjectMetaData(currentChat.current, user!)
                          .avatar!
                      }
                    />
                  )}
                  <div
                    onClick={() => {
                      if (currentChat.current?.isGroupChat) return;
                      const otherUser = currentChat.current?.participants.find(
                        (p) => p.username !== user.username
                      );
                      if (otherUser?._id === process.env.NEXT_PUBLIC_AI_BOT_ID)
                        return;
                      router.push(`/c/${otherUser?.username}`);
                    }}
                  >
                    <p className="cursor-pointer font-bold flex md:gap-5">
                      {getChatObjectMetaData(currentChat.current, user!).title}
                    </p>

                    <small className="text-zinc-400">
                      {
                        getChatObjectMetaData(currentChat.current, user!)
                          .description
                      }
                    </small>
                  </div>
                </div>
                <X
                  onClick={() => {
                    setisInChat(false);
                    currentChat.current = null;
                    localStorage.removeItem("currentChat");
                  }}
                  className="w-5 md:hidden"
                />
              </div>
              <div
                className={classNames(
                  "md:p-8 p-3 overflow-y-auto flex flex-col-reverse gap-3 md:gap-6 w-full",
                  attachedFiles.length > 0
                    ? "h-[calc(100vh-336px)]"
                    : "h-[calc(100vh-176px)]"
                )}
                id="message-window"
              >
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-[calc(100%-88px)]">
                    <Typing />
                  </div>
                ) : (
                  <>
                    {isTyping ? <Typing /> : null}
                    {messages?.map((msg) => {
                      return (
                        <MessageItem
                          key={msg._id}
                          isOwnMessage={msg.sender?._id === user?._id}
                          isAIMessage={
                            
                            msg.sender._id === process.env.NEXT_PUBLIC_AI_BOT_ID
                          }
                          isGroupChatMessage={currentChat.current?.isGroupChat}
                          message={msg}
                          deleteChatMessage={() => deleteChatMessage(msg)}
                        />
                      );
                    })}
                  </>
                )}
              </div>
              {attachedFiles.length > 0 ? (
                <div className="grid gap-4 grid-cols-5 p-4 justify-start max-w-fit">
                  {attachedFiles.map((file, i) => {
                    return (
                      <div
                        key={i}
                        className="group w-32 h-32 relative aspect-square rounded-xl cursor-pointer"
                      >
                        <div className="absolute inset-0 flex justify-center items-center w-full h-full bg-black/40 group-hover:opacity-100 opacity-0 transition-opacity ease-in-out duration-150">
                          <button
                            onClick={() => {
                              setAttachedFiles(
                                attachedFiles.filter((_, ind) => ind !== i)
                              );
                            }}
                            className="absolute -top-2 -right-2"
                          >
                            <XCircleIcon className="h-6 w-6 text-white" />
                          </button>
                        </div>
                        <img
                          className="h-full rounded-xl w-full object-cover"
                          src={URL.createObjectURL(file)}
                          alt="attachment"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
              <div className="sticky top-full md:p-4 p-2 flex justify-between items-center w-full gap-2 border-t-[0.1px] border-secondary">
                <input
                  hidden
                  id="attachments"
                  type="file"
                  value=""
                  multiple
                  max={5}
                  onChange={(e) => {
                    if (e.target.files) {
                      setAttachedFiles([...e.target.files]);
                    }
                  }}
                />
                <label
                  htmlFor="attachments"
                  className="p-4 rounded-full bg-dark hover:bg-secondary"
                >
                  <PaperClipIcon className="md:w-6 md:h-6 w-4 h-4" />
                </label>

                <div className="relative w-full">
                  {user.subscription?.active ? (
                    <span
                      onClick={() => {
                        if (!isLoadingMessage) {
                          
                          handleEnhanceMessage(message);
                        }
                      }}
                      className="absolute right-2 top-1.5"
                    >
                       <Tooltip>
                        <TooltipTrigger asChild>
                          <Image 
                      
                          src={'/AI.png'}
                          width={35}
                          height={35}
                          alt="AI Icon"
                          className="invert-100"
                         />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>AI Message Enhancer</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  ) : (
                    <span className="absolute right-2 top-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                         <Image 
                         onClick={() => router.push('/upgrade')}
                          src={'/AI.png'}
                          width={35}
                          height={35}
                          alt="AI Icon"
                          className="opacity-50 invert-100"
                         />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upgrade your plan</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  )}
                  {
                    isLoadingMessage && (
                      <span className="absolute top-2 left-2"> 
                        <Skeleton className="h-[34px] bg-gray-500 w-[600px] rounded-lg" />
                      </span>
                    )
                  }
                  <Input
                    className="w-[100%]"
                    placeholder="Message"
                    value={message}
                    disabled={isLoadingMessage}
                    // disabled={isSendingMessageToAI}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      // handleOnMessageChange(e)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (currentChat.current?.name === "AI Chat") {
                          setMessage("");
                          sendAIChatMessage();
                        } else {
                          setMessage("");
                          sendChatMessage();
                        }
                      }
                    }}
                  />
                </div>
                <button
                  onClick={
                    currentChat.current.name === "AI Chat"
                      ? () => {
                          setMessage("");
                          sendAIChatMessage();
                        }
                      : () => {
                          setMessage("");
                          sendChatMessage();
                        }
                  }
                  disabled={
                    (!message && attachedFiles?.length <= 0) ||
                    isSendingMessageToAI
                  }
                  className="p-4 rounded-full bg-dark hover:bg-secondary disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="md:w-6 md:h-6 w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              No chat selected
            </div>
          )}
        </div>
      </div>
      <BackgroundBeams />
    </>
  );
};

export default page;
