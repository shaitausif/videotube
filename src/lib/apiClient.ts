// Import necessary modules and utilities
import axios from 'axios'


const apiClient = axios.create({
    baseURL : process.env.NEXT_PUBLIC_SERVER_URI,
    withCredentials : true,
    timeout : 120000
})

const nativeApiClient = axios.create({
  withCredentials : true,
  timeout : 120000
})

export default apiClient;

const getAvailableUsers = () => {
  return apiClient.get("/chat-app/chats/users");
};

const getUserChats = () => {
  return apiClient.get(`/chat-app/chats`);
};

const createorGetAIChat = () => {
  return apiClient.post(`/chat-app/chats/ai`)
}

const createUserChat = (receiverId: string) => {
  return apiClient.post(`/chat-app/chats/c/${receiverId}`);
};




const createGroupChat = (data: { name: string; participants: string[] }) => {
  return apiClient.post(`/chat-app/chats/group`, data);
};

const getGroupInfo = (chatId: string) => {
  return apiClient.get(`/chat-app/chats/group/${chatId}`);
};

const updateGroupName = (chatId: string, name: string) => {
  return apiClient.patch(`/chat-app/chats/group/${chatId}`, { name });
};

const deleteGroup = (chatId: string) => {
  return apiClient.delete(`/chat-app/chats/group/${chatId}`);
};

const deleteOneOnOneChat = (chatId: string) => {
  return apiClient.delete(`/chat-app/chats/remove/${chatId}`);
};

const addParticipantToGroup = (chatId: string, participantId: string) => {
  return apiClient.post(`/chat-app/chats/group/${chatId}/${participantId}`);
};

const removeParticipantFromGroup = (chatId: string, participantId: string) => {
  return apiClient.delete(`/chat-app/chats/group/${chatId}/${participantId}`);
};

const getChatMessages = (chatId: string) => {
  return apiClient.get(`/chat-app/messages/${chatId}`);
};

const sendMessage = (chatId: string, content: string, attachments: File[]) => {
  const formData = new FormData();
  if (content) {
    formData.append("content", content);
  }
  attachments?.map((file) => {
    formData.append("attachments", file);
  });
  return apiClient.post(`/chat-app/messages/${chatId}`, formData);
};


const sendAIMessage = (chatId: string, content : string) => {
  return apiClient.post(`/chat-app/messages/ai/${chatId}`,{content: content})
}



const deleteMessage = (chatId: string, messageId: string) => {
  return apiClient.delete(`/chat-app/messages/${chatId}/${messageId}`);
};


const editAvatar = (file : File) => {
  const formData = new FormData();
  if(formData){
    formData.append("avatar",file)
    return nativeApiClient.put('/api/user/update-avatar',formData)
  }
  console.log("Hey , These is an error in editAvatar")
  throw new Error("Avatar is required")
}

const editCoverImage = (file: File) => {
  const formData = new FormData()
  if(formData){
    formData.append("coverImage",file)
    return nativeApiClient.put('/api/user/update-cover-image',formData)
  }
  console.log("Hey, The error is inside editCoverImage")
  throw new Error("CoverImage is required")
}

const getUserSubscriberCount = () => {
  return nativeApiClient.get('/api/user/get-current-user-subscriber-count')
}


const getUserInfo = () => {
  return nativeApiClient.get('/api/auth/get-user-info')
}

const setOauthCustomToken = () => {
  return nativeApiClient.post('/api/user/set-custom-cookies')
}

const getAllVideos = (page? : number, limit? : number , query? : string, sortBy? : any, sortType? : any, userId? : string) => {
  return nativeApiClient.get(`/api/video/videos`)
}


const getWatchHistory = () => {
  return nativeApiClient.get('/api/user/get-user-watch-history')
}

const getVideoById = (videoId : any) => {
    
    return nativeApiClient.get(`/api/video/videoById/${videoId}`)
  
}


const getVideoComments = (videoId: any) => {
  return nativeApiClient.get(`/api/comment/get-or-set/${videoId}`)
}


const toggleSubscribe = (channelId : string) => {
  return nativeApiClient.post(`/api/subscription/toggle-subscribers/${channelId}`)
}


const toggleVideoLike = (videoId: string) => {
  return nativeApiClient.post(`/api/like/video/${videoId}`)
}


// Export all the API functions
export {
  addParticipantToGroup,
  createGroupChat,
  createUserChat,
  deleteGroup,
  deleteOneOnOneChat,
  getAvailableUsers,
  getChatMessages,
  getGroupInfo,
  getUserChats,
  removeParticipantFromGroup,
  sendMessage,
  updateGroupName,
  deleteMessage,
  sendAIMessage,
  createorGetAIChat,
  editAvatar,
  editCoverImage,
  getUserSubscriberCount,
  getUserInfo,
  setOauthCustomToken,
  getAllVideos,
  getWatchHistory,
  getVideoById,
  getVideoComments,
  toggleSubscribe,
  toggleVideoLike
};
