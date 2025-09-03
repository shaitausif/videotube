// Import necessary modules and utilities
import { postSchema } from '@/schemas/PostSchema';
import { UploadVideoSchema } from '@/schemas/UploadVideoSchema';
import axios from 'axios'
import z from 'zod';


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


const userChannelProfile = (username: string) => {
  return nativeApiClient.get(`/api/user/get-user-channel-profile/${username}`)
}


const postComment = (videoId: string, content: string) => {
  return nativeApiClient.post(`/api/comment/get-or-set/${videoId}`,{content})
}


const deleteComment = (commentId : string) => {
  return nativeApiClient.delete(`/api/comment/update-or-delete/${commentId}`)
}

const toggleCommentLike = (commentId: string) => {
  return nativeApiClient.post(`/api/like/comment/${commentId}`)
}


const getUserVideos = (userId : string) => {
  return nativeApiClient.get(`/api/video/videosById/${userId}`)
}



const uploadVideo = (data: z.infer<typeof UploadVideoSchema>) => {
  try {
    const formData = new FormData()
    formData.append("title",data.title)
    formData.append("description",data.description)
    formData.append("videoFile",data.videoFile)
    formData.append("thumbnail",data.thumbnail)
    
    return nativeApiClient.post(`/api/video/videos`,formData)
  } catch (error) {
    console.log("Error",error)
  }
}


const deleteVideo = (videoId: string) => {
  return nativeApiClient.delete(`/api/video/videoById/${videoId}`)
}



const uploadPost = (data: z.infer<typeof postSchema>) => {
  try {
    const formData = new FormData()
    formData.append("postImg",data.postImg)
    formData.append("caption",data.caption)
    
    return nativeApiClient.post(`/api/post/create-or-get`,formData)
  } catch (error) {
    console.log("Error",error)
  }
}


const allPosts = () => {
  return nativeApiClient.get(`/api/post/create-or-get`)
}


const deletePost = (postId : string) => {
  return nativeApiClient.delete(`/api/post/delete-post/${postId}`)
}


const userPosts = (userId : string) => {
  return nativeApiClient.get(`/api/post/get-user-posts/${userId}`)
}


const togglePostLike = (postId: string) => {
  return nativeApiClient.post(`/api/like/post/${postId}`)
}


const createTweet = (tweet: string) => {
  return nativeApiClient.post(`/api/tweet/create`,{content : tweet})
}


const userTweets = (userId: string) => {
  return nativeApiClient.get(`/api/tweet/get-tweet/${userId}`)
}


const toggleTweetLikes = (tweetId: string) => {
  return nativeApiClient.post(`/api/like/tweet/${tweetId}`)
}


const deleteTweet = (tweetId: string) => {
  return nativeApiClient.delete(`/api/tweet/${tweetId}`)
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
  toggleVideoLike,
  userChannelProfile,
  postComment,
  deleteComment,
  toggleCommentLike,
  getUserVideos,
  uploadVideo,
  deleteVideo,
  uploadPost,
  allPosts,
  userPosts,
  deletePost,
  togglePostLike,
  createTweet,
  userTweets,
  toggleTweetLikes,
  deleteTweet
};
